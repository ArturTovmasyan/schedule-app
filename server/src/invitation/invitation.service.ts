import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, In, Repository } from 'typeorm';
import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { InvitationPendingEmails } from './entities/invitation-pending-emails.entity';
import { IResponseMessage } from 'src/components/interfaces/response.interface';
import { ErrorMessages } from 'src/components/constants/error.messages';
import { InvitationStatusEnum } from './enums/invitation-status.enum';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { MailService, MailTemplate } from '../mail/mail.service';
import { Invitation } from './entities/invitation.entity';
import { User } from '@user/entity/user.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Invitation)
    private readonly invitationRepo: Repository<Invitation>,
    @InjectRepository(InvitationPendingEmails)
    private readonly invitationPendingEmailsRepo: Repository<InvitationPendingEmails>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
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

    const bulkInvitationPendingEmails: QueryDeepPartialEntity<InvitationPendingEmails>[] =
      [];

    createInvitationDto.emails.map((email) => {
      const invitationId = randomUUID();
      bulkInvitations.push({
        id: invitationId,
        toEmail: email,
        user: { id: user.id },
        message: createInvitationDto.message,
      });

      bulkInvitationPendingEmails.push({
        user,
        invitation: { id: invitationId },
        email,
        comment: createInvitationDto.message,
        accessRequest: createInvitationDto.requestCalendarView,
        shareCalendar: createInvitationDto.shareMyCalendar,
        timeForAccess: createInvitationDto.endDate,
      });
    });

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(Invitation)
        .values(bulkInvitations)
        .returning('id')
        .execute();

      this.mailService.send({
        from: this.configService.get<string>('NO_REPLY_EMAIL'),
        templateId: MailTemplate.INVITE_EMAIL,
        personalizations: [
          {
            to: createInvitationDto.emails,
            dynamicTemplateData: {
              ...this.mailService.defaultTemplateData,
              name: `${user.firstName} ${user.lastName}`.trim(),
              confirmation_url: `${process.env.WEB_HOST}register`,
            },
          },
        ],
      });

      await queryRunner.commitTransaction();

      if (
        createInvitationDto.requestCalendarView ||
        createInvitationDto.shareMyCalendar
      ) {
        await this.invitationPendingEmailsRepo.insert(
          bulkInvitationPendingEmails,
        );
      }

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

  /**
   * @description `Set invitation status as pre social login for accepting invitation using social login`
   * @param id - `ID of invitation`
   */

  async setToPreSocialLogin(id: string): Promise<IResponseMessage> {
    await this.invitationRepo.update(
      { id },
      { status: InvitationStatusEnum.PreSocialLogin },
    );

    return { message: 'updated', status: HttpStatus.ACCEPTED };
  }

  remove(id: number) {
    return `This action removes a #${id} invitation`;
  }
}
