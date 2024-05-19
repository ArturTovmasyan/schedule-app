import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, In, Repository } from 'typeorm';
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
  CreateAccessRequestDto,
  AccessRequestStatus,
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
    private readonly notificationsService: NotificationsService,
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
    if (createAccessRequestDto.toEmails.includes(user.email)) {
      throw new BadRequestException({
        message: ErrorMessages.cantSentYourself,
      });
    }

    const checkExists = await this.accessRequestRepo.count({
      where: {
        toEmail: In(createAccessRequestDto.toEmails),
        applicant: { id: user.id },
      },
    });

    if (checkExists) {
      throw new BadRequestException({
        message: ErrorMessages.alreadySentRequest,
      });
    }

    await this.calendarAccessService.checkAccess(
      user,
      createAccessRequestDto.toEmails,
    );

    const findUsersByEmail = await this.userRepo.find({
      where: { email: In(createAccessRequestDto.toEmails) },
    });

    const bulkData: QueryDeepPartialEntity<AccessRequest>[] = [];

    createAccessRequestDto.toEmails.forEach((email) => {
      const currentUser = findUsersByEmail.filter(
        (user) => user.email === email,
      )[0];

      bulkData.push({
        applicant: { id: user.id },
        toEmail: email,
        receiver: { id: currentUser ? currentUser.id : null },
        timeForAccess: createAccessRequestDto.timeForAccess,
        comment: createAccessRequestDto.comment,
      });
    });

    const data = await this.accessRequestRepo
      .createQueryBuilder()
      .insert()
      .into(AccessRequest)
      .values(bulkData)
      .returning('*')
      .execute();

    const notifiacationBulk: {
      type: NotificationTypeEnum;
      receiverUserId: string;
      accessRequestId: string;
    }[] = [];

    data.generatedMaps.forEach((request) => {
      if (request.receiverUserId) {
        notifiacationBulk.push({
          type: NotificationTypeEnum.AccessRequest,
          receiverUserId: request.receiverUserId,
          accessRequestId: request.id,
        });
      }
    });

    await this.notificationsService.create(user, notifiacationBulk);

    bulkData.forEach((current) => {
      const currentUser = findUsersByEmail.filter(
        (user) => user.email === current.toEmail,
      )[0];

      this.mailService.send({
          from: this.configService.get<string>('NO_REPLY_EMAIL'),
          templateId: MailTemplate.CALENDAR_REQUESTED,
          personalizations: [{
              to: user.email,
              dynamicTemplateData: {
                  ...this.mailService.defaultTemplateData,
                  name: `${user.firstName} ${user.lastName}`.trim(),
                  invite_url: `${process.env.WEB_HOST}`
              }
          }]
      });
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

      // await this.calendarAccessService.checkAccess(user, [data.toEmail]);

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
        .where([{id: id}])
        .execute();

      if (accessRequestStatus.status === AccessRequestStatusEnum.Accept) {
        await Promise.all([
          this.notificationsService.create(user, [
            {
              type: NotificationTypeEnum.RequestApproved,
              receiverUserId: data.applicant.id,
            },
          ]),
          this.calendarAccessRepo.upsert(
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
          ),
        ]);
      } else {
        await this.notificationsService.create(user, [
          {
            type: NotificationTypeEnum.RequestDenied,
            receiverUserId: data.applicant.id,
          },
        ]);
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
