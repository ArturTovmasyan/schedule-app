import * as moment from 'moment';
import { ConfigService } from '@nestjs/config';
import { Repository, Connection } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';

import { CalendarAccess } from 'src/calendar/calendar-access/entities/calendar-access.entity';
import { CalendarAccessService } from 'src/calendar/calendar-access/calendar-access.service';
import { TimeForAccessEnum } from 'src/calendar/calendar-access/enums/access-time.enum';
import { AccessRequest } from './entities/access-request.entity';
import { ErrorMessages } from '@shared/error.messages';
import { MailService } from '../mail/mail.service';
import { User } from '@user/entity/user.entity';
import {
  AccessRequestStatusEnum,
  RequestStatusEnum,
} from './enums/requestStatus.enum';
import {
  AccessRequestQueryParams,
  AccessRequestStatus,
  CreateAccessRequestDto,
} from './dto/create-access-request.dto';

@Injectable()
export class AccessRequestService {
  constructor(
    @InjectRepository(AccessRequest)
    private readonly accessRequestRepo: Repository<AccessRequest>,
    @InjectRepository(CalendarAccess)
    private readonly calendarAccessRepo: Repository<CalendarAccess>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly mailService: MailService,
    private readonly calendarAccessService: CalendarAccessService,
    private readonly configService: ConfigService,
    private readonly connection: Connection,
  ) {}

  /**
   * @description `Create access request to other person's email`
   *
   * @param user - `Authorized user data`
   * @param createAccessRequestDto - `Validated data for creating access request`
   *
   * @returns `Request is sent`
   */

  async create(
    user: User,
    createAccessRequestDto: CreateAccessRequestDto,
  ): Promise<{ message: string; status: number }> {
    if (createAccessRequestDto.toEmail === user.email) {
      throw new BadRequestException({
        message: ErrorMessages.cantSentYourself,
      });
    }

    const checkExists = await this.accessRequestRepo.count({
      where: {
        toEmail: createAccessRequestDto.toEmail,
        applicant: { id: user.id },
      },
    });

    if (checkExists) {
      throw new BadRequestException({
        message: ErrorMessages.alreadySentRequest,
      });
    }

    await this.calendarAccessService.checkAccess(user, [
      createAccessRequestDto.toEmail,
    ]);

    const findUserByEmail = await this.userRepo.findOne({
      where: { email: createAccessRequestDto.toEmail },
    });

    let timeForAccess: Date | null = null;

    if (createAccessRequestDto.timeForAccess === TimeForAccessEnum.month) {
      timeForAccess = moment().add(30, 'day').toDate();
    } else if (
      createAccessRequestDto.timeForAccess === TimeForAccessEnum.week
    ) {
      timeForAccess = moment().add(7, 'day').toDate();
    } else if (
      createAccessRequestDto.timeForAccess === TimeForAccessEnum.quarter
    ) {
      timeForAccess = moment().add(3, 'month').toDate();
    }

    await this.accessRequestRepo.save({
      applicant: { id: user.id },
      toEmail: createAccessRequestDto.toEmail,
      receiver: { id: findUserByEmail ? findUserByEmail.id : null },
      timeForAccess,
      comment: createAccessRequestDto.comment,
    });

    await this.mailService.send({
      from: this.configService.get<string>('NO_REPLY_EMAIL'),
      to: createAccessRequestDto.toEmail,
      subject: `Access request from ${user.firstName} ${user.lastName}`,
      html: `
      <h3>Hello!</h3>
    ${
      findUserByEmail
        ? `<p>${user.firstName} ${user.lastName} wants to access your calendar.
        Please go to <a href='${process.env.WEB_HOST}'>homepage</a> to accept or decline request.</p>`
        : `<p><a href='${process.env.WEB_HOST}register'>Register</a> and approve the request from ${user.firstName} ${user.lastName}</p>`
    }
  `,
    });

    return { message: 'Request is sent', status: HttpStatus.OK };
  }

  /**
   * @description `Find access requests`
   *
   * @param user - `Authorized user data`
   * @param query - `status(pending,accepted,declined)`
   *
   * @returns `AccessRequest data array and count`
   */

  async findAll(
    user: User,
    query: AccessRequestQueryParams,
  ): Promise<{ data: AccessRequest[]; count: number }> {
    const [data, count] = await this.accessRequestRepo
      .createQueryBuilder('accessRequest')
      .select([
        'accessRequest.id',
        'accessRequest.timeForAccess',
        'accessRequest.toEmail',
        'accessRequest.comment',
        'accessRequest.status',
      ])
      .leftJoin('accessRequest.applicant', 'applicant')
      .addSelect([
        'applicant.id',
        'applicant.email',
        'applicant.lastName',
        'applicant.firstName',
      ])
      .where(
        `(accessRequest.toEmail = '${user.email}' OR accessRequest.receiverUserId = '${user.id}')` +
          (query.status
            ? ` AND (accessRequest.status = '${query.status}')`
            : ''),
      )
      .getManyAndCount();

    return { data, count };
  }

  findOne(id: number) {
    return `This action returns a #${id} accessRequest`;
  }

  /**
   * @description `Accept or decline access request`
   *
   * @param user - `Authorized user data`
   * @param id - `request id`
   * @param accessRequestStatus - `accept or decline`
   *
   * @returns `{accepted or declined message}`
   */

  async update(
    user: User,
    id: string,
    accessRequestStatus: AccessRequestStatus,
  ): Promise<{ message: string; status: number }> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const data = await this.accessRequestRepo
        .createQueryBuilder('accessRequest')
        .innerJoin('accessRequest.applicant', 'applicant')
        .addSelect(['applicant.id'])
        .where({ id })
        .getOne();

      if (!data) {
        throw new BadRequestException({
          message: ErrorMessages.accessRequestNotFound,
        });
      }

      await this.calendarAccessService.checkAccess(user, [data.toEmail]);

      await queryRunner.manager
        .createQueryBuilder()
        .update(AccessRequest)
        .set({
          receiver: { id: user.id },
          status:
            accessRequestStatus.status === AccessRequestStatusEnum.Accept
              ? RequestStatusEnum.Accepted
              : RequestStatusEnum.Declined,
        })
        .where([{ receiver: { id: user.id } }, { toEmail: user.email }])
        .execute();

      if (accessRequestStatus.status === AccessRequestStatusEnum.Accept) {
        await this.calendarAccessRepo.upsert(
          {
            accessedUser: { id: data.applicant.id },
            owner: { id: user.id },
            toEmail: data.toEmail,
            comment: data.comment,
            timeForAccess: data.timeForAccess,
          },
          {
            conflictPaths: ['toEmail', 'owner'],
            skipUpdateIfNoValuesChanged: true,
          },
        );
      }

      await queryRunner.commitTransaction();

      return {
        message: accessRequestStatus.status,
        status: HttpStatus.ACCEPTED,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException({ message: error.message });
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * @description `Remove access request`
   *
   * @param user - `Authorized user data`
   * @param id - `Access request id`
   *
   * @returns `{deleted message}`
   */

  async remove(
    user: User,
    id: string,
  ): Promise<{ message: string; status: number }> {
    const data = await this.accessRequestRepo
      .createQueryBuilder('accessRequest')
      .delete()
      .from(AccessRequest)
      .where('id = :id', { id })
      .andWhere('toEmail = :email', { email: user.email })
      .execute();

    if (!data.affected) {
      throw new BadRequestException({
        message: ErrorMessages.accessRequestNotFound,
      });
    }

    return { message: `Deleted`, status: HttpStatus.ACCEPTED };
  }
}
