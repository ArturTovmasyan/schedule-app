import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { CalendarEventService } from 'src/calendar/calendar-event/calendar-event.service';
import { CalendarEvent } from 'src/calendar/calendar-event/entities/calendarEvent.entity';
import { IResponse } from 'src/components/interfaces/response.interface';
import { ErrorMessages } from 'src/components/constants/error.messages';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { User } from '@user/entity/user.entity';
import { Invitation } from 'src/invitation/entities/invitation.entity';
import { InvitationStatusEnum } from 'src/invitation/enums/invitation-status.enum';

@Injectable()
export class ContactsService {
  constructor(
    private readonly calendarEventService: CalendarEventService,
    @InjectRepository(CalendarEvent)
    private readonly calendarEventRepository: Repository<CalendarEvent>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
  ) {}
  create(createContactDto: CreateContactDto) {
    return 'This action adds a new contact';
  }

  findOne(id: number) {
    return `This action returns a #${id} contact`;
  }

  update(id: number, updateContactDto: UpdateContactDto) {
    return `This action updates a #${id} contact`;
  }

  remove(id: number) {
    return `This action removes a #${id} contact`;
  }

  /**
   * @description `Find recommended contacts fro calendar events`
   * @param user - `Authorized user data`
   * @returns `Array of users`
   */

  async findAll(
    user: User,
  ): Promise<IResponse<{ users: User[]; unregisteredEmails: string[] }>> {
    return this.calendarEventRepository.manager.transaction(async (manager) => {
      const tokens = await this.calendarEventService.getTokens(user, manager);

      //TODO exclude my email and check if already share-request exist
      const eventEmails = await this.calendarEventRepository
        .createQueryBuilder('event')
        .select(['event.creatorFromGoogle', 'event.creatorFromOutlook'])
        .where(
          `${
            tokens.googleToken
              ? `(event.creatorFromGoogle <>:googleEmail AND event.creatorFromGoogle <> '${user.email}') OR`
              : 'event.creatorFromGoogle IS NULL OR'
          } ${
            tokens.outlookToken
              ? `event.creatorFromOutlook <>:outlookEmail AND event.creatorFromOutlook <> '${user.email}'`
              : 'event.creatorFromOutlook IS NULL'
          }`,
          {
            googleEmail: tokens.googleToken?.ownerEmail ?? null,
            outlookEmail: tokens.outlookToken?.ownerEmail ?? null,
          },
        )
        .getMany();

      const emails: string[] = [];

      for (let i in eventEmails) {
        if (
          !eventEmails[i].creatorFromGoogle &&
          !eventEmails[i].creatorFromOutlook
        ) {
          break;
        }
        if (eventEmails[i].creatorFromGoogle) {
          emails.push(eventEmails[i].creatorFromGoogle);
        }
        if (eventEmails[i].creatorFromOutlook) {
          emails.push(eventEmails[i].creatorFromOutlook);
        }
      }

      if (!emails.length) {
        throw new NotFoundException({
          message: ErrorMessages.contactsNotFound,
        });
      }

      const usersFromDb = await this.userRepository.find({
        where: { email: In(emails) },
        select: ['id', 'firstName', 'lastName', 'email'],
      });

      // const unregisteredEmails = emails.filter(
      //   (email) => !usersFromDb.map((user) => user.email).includes(email),
      // );

      const unregisteredEmails:any = [
        'lendrush@mail.ru',
        'test@mail.ru',
      ];

      const users = await this.userRepository
        .createQueryBuilder('user')
        .where({ id: In(usersFromDb.map((user) => user.id)) })
        .select(['user.id', 'user.email', 'user.firstName', 'user.lastName'])
        .leftJoin('user.accessTo', 'accessTo')
        .leftJoin('user.sharedWith', 'sharedWith')
        .andWhere(
          `((accessTo.ownerId IS NULL) OR (sharedWith.accessedUserId IS NULL)) OR (accessTo.ownerId <>:userId OR sharedWith.accessedUserId <>:userId)`,
          {
            userIds: usersFromDb.map((user) => user.id),
            userId: user.id,
          },
        )
        .getMany();

      return { data: { users, unregisteredEmails } };
    });
  }
}
