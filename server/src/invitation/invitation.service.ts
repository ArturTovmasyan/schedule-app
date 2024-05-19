import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, In, Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { CalendarAccess } from 'src/calendar-access/entities/calendar-access.entity';
import { CalendarAccessService } from 'src/calendar-access/calendar-access.service';
import { IResponseMessage } from 'src/components/interfaces/response.interface';
import { ErrorMessages } from 'src/components/constants/error.messages';
import { InvitationStatusEnum } from './enums/invitation-status.enum';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { Invitation } from './entities/invitation.entity';
import { MailService } from '../mail/mail.service';
import { User } from '@user/entity/user.entity';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Invitation)
    private readonly invitationRepo: Repository<Invitation>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly calendarAccessService: CalendarAccessService,
    private readonly connection: Connection,
  ) {}

  /**
   * @description `Send invitation to mails`
   *
   * @param user - `Authorized user data`
   * @param createInvitationDto - `Emails list,give access boolean and optional message`
   *
   * @returns `{message:'invited',status:1}`
   */

  async create(
    user: User,
    createInvitationDto: CreateInvitationDto,
  ): Promise<IResponseMessage> {
    const checkExists = await this.userRepo.count({
      where: { email: In(createInvitationDto.emails) },
    });

    if (checkExists) {
      throw new BadRequestException({
        message: ErrorMessages.emailAlreadyExists,
      });
    }

    if (createInvitationDto.emails.indexOf(user.email) !== -1) {
      throw new BadRequestException({
        message: ErrorMessages.cantInviteYourself,
      });
    }

    const bulkInvitations: QueryDeepPartialEntity<Invitation>[] = [];

    createInvitationDto.emails.map((email) => {
      bulkInvitations.push({
        toEmail: email,
        user: { id: user.id },
        message: createInvitationDto.message,
      });
    });

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const invitation = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(Invitation)
        .values(bulkInvitations)
        .returning('id')
        .execute();

      if (createInvitationDto.giveAccess) {
        await this.calendarAccessService.checkAccess(
          user,
          createInvitationDto.emails,
        );

        const bulkAccess: QueryDeepPartialEntity<CalendarAccess>[] = [];

        createInvitationDto.emails.map((email) => {
          bulkAccess.push({
            owner: { id: user.id },
            toEmail: email,
            comment: 'You were invited to entangles.io',
          });
        });

        await Promise.all([
          queryRunner.manager.getRepository(CalendarAccess).upsert(bulkAccess, {
            conflictPaths: ['toEmail', 'owner'],
            skipUpdateIfNoValuesChanged: true,
          }),
          this.mailService.send({
            from: this.configService.get<string>('NO_REPLY_EMAIL'),
            to: createInvitationDto.emails,
            subject: `${user.firstName} ${user.lastName} invited you to use entangles.io`,
            html: `
          <h3>Hello!</h3>
         <p>${
           (createInvitationDto.message ?? '') +
           `</p><p>You're <a href='${process.env.WEB_HOST}register?invitationId=${invitation.raw[0].id}'>invited</a> and you also have access to the calendar of the ${user.firstName} ${user.lastName}`
         }</p>
      `,
          }),
        ]);
      } else {
        await this.mailService.send({
          from: this.configService.get<string>('NO_REPLY_EMAIL'),
          to: createInvitationDto.emails,
          subject: `${user.firstName} ${user.lastName} invited you to use entangles.io`,
          html: `
          <h3>Hello!</h3>
         <p>${
           (createInvitationDto.message ?? '') +
           `</p><br/><p>. ${user.firstName} ${user.lastName} invited you to use <a href='${process.env.WEB_HOST}register?invitationId=${invitation.raw[0].id}'>entangles.io</a>`
         }</p>
      `,
        });
      }

      await queryRunner.commitTransaction();

      return { message: 'Invited', status: 1 };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw new BadRequestException({ message: error.message });
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return `This action returns all invitation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} invitation`;
  }

  async update(id: string) {
    await this.invitationRepo.update(
      { id },
      { status: InvitationStatusEnum.Accepted },
    );
  }

  remove(id: number) {
    return `This action removes a #${id} invitation`;
  }
}
