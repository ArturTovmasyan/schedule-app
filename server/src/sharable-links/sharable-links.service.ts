import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import * as moment from 'moment';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Connection, In, Repository } from 'typeorm';

import { CalendarEvent } from 'src/calendar/calendar-event/entities/calendarEvent.entity';
import { CalendarEventService } from 'src/calendar/calendar-event/calendar-event.service';
import { SharableLinkAttendeesEntity } from './entities/sharable-link-attendees.entity';
import { SharableLinkSlotsEntity } from './entities/sharable-link-slots.entity';
import { Calendar } from 'src/calendar/calendar-event/entities/calendar.entity';
import { ErrorMessages } from 'src/components/constants/error.messages';
import { UpdateSharableLinkDto } from './dto/update-sharable-link.dto';
import { SharableLinkEntity } from './entities/sharable-link.entity';
import { IPaginate } from './interfaces/sharable-links.interface';
import { ZoomService } from 'src/integrations/zoom/zoom.service';
import { MeetViaEnum } from './enums/sharable-links.enum';
import { User } from '@user/entity/user.entity';
import {
  IResponse,
  IResponseMessageWithData,
} from 'src/components/interfaces/response.interface';
import {
  SharableLinkSlot,
  CreateSharableLinkDto,
  SelectSlotPublic,
  CancelMeetingDto,
  RescheduleMeetingDto,
} from './dto/create-sharable-link.dto';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class SharableLinksService {
  constructor(
    @InjectRepository(CalendarEvent)
    private readonly calendarEventsRepo: Repository<CalendarEvent>,
    private readonly connection: Connection,
    private readonly calendarEventService: CalendarEventService,
    private readonly zoomService: ZoomService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * @description `Create Sharable link`
   *
   * @param user - `Authorized user data`
   * @param createSharableLinkDto - `Attendees(optional), slots(start,end dates) meeting via`
   *
   * @returns `Created`
   */

  async create(
    user: User,
    createSharableLinkDto: CreateSharableLinkDto,
  ): Promise<IResponseMessage> {
    await this._checkSlotAvailability(user, createSharableLinkDto.slots);

    if (
      (createSharableLinkDto.meetVia === MeetViaEnum.InboundCall ||
        createSharableLinkDto.meetVia === MeetViaEnum.OutboundCall) &&
      !createSharableLinkDto.phoneNumber
    ) {
      throw new BadRequestException({
        message: ErrorMessages.phoneNumberNotSpecified,
      });
    }

    if (
      createSharableLinkDto.meetVia === MeetViaEnum.PhysicalAddress &&
      !createSharableLinkDto.address
    ) {
      throw new BadRequestException({
        message: ErrorMessages.addressNumberNotSpecified,
      });
    }

    const sharableLinkId = randomUUID();
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.getRepository(SharableLinkEntity).insert({
        id: sharableLinkId,
        sharedBy: user.id,
        meetVia: createSharableLinkDto.meetVia,
        phoneNumber: createSharableLinkDto.phoneNumber,
        address: createSharableLinkDto.address,
        title: createSharableLinkDto.title,
        link: process.env.WEB_HOST + 'sharable-links/' + sharableLinkId,
      });

      if (createSharableLinkDto.attendees?.length) {
        await queryRunner.manager
          .getRepository(SharableLinkAttendeesEntity)
          .insert(
            createSharableLinkDto.attendees.map((attendee) => {
              return {
                linkId: sharableLinkId,
                userId: attendee,
              };
            }),
          );
      }

      await queryRunner.manager.getRepository(SharableLinkSlotsEntity).insert(
        createSharableLinkDto.slots.map((slot) => {
          return {
            linkId: sharableLinkId,
            startDate: slot.startDate,
            endDate: slot.endDate,
          };
        }),
      );

      await queryRunner.commitTransaction();

      return { message: 'Created', status: 1, metadata: { sharableLinkId } };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw new BadRequestException({ message: error.message });
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * @description `Update sharable link`
   * @README `Attendees array is not for new addable attendees,this is full modified list of attendees`
   * @param sharableLinkId - `ID of sharable link`
   * @param user - `Authorized user data`
   * @param updateSharableLinkDto - `UpdateSharableLinkDto object`
   *
   * @returns `Updated`
   */

  async update(
    sharableLinkId: string,
    user: User,
    updateSharableLinkDto: UpdateSharableLinkDto,
  ): Promise<IResponseMessage> {
    const { deleteSlots, addSlots } = updateSharableLinkDto;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sharableLink = (await this.findOne(sharableLinkId)).data;

      if (!sharableLink || sharableLink.sharedBy !== user.id) {
        throw new NotFoundException({
          message: ErrorMessages.sharableLinkNotFound,
        });
      }

      if (addSlots && addSlots.length) {
        await this._checkSlotAvailability(user, addSlots);

        await queryRunner.manager.getRepository(SharableLinkSlotsEntity).insert(
          addSlots.map((slot) => {
            return {
              linkId: sharableLinkId,
              startDate: slot.startDate,
              endDate: slot.endDate,
            };
          }),
        );
      }

      if (deleteSlots && deleteSlots.length) {
        if (
          deleteSlots.some(
            (id) =>
              sharableLink.slots.map((slot) => slot.id).indexOf(id) === -1,
          )
        ) {
          throw new NotFoundException({ message: ErrorMessages.slotNotFound });
        }

        await queryRunner.manager
          .getRepository(SharableLinkSlotsEntity)
          .delete({ id: In(deleteSlots) });
      }

      await queryRunner.manager
        .getRepository(SharableLinkAttendeesEntity)
        .delete({ linkId: sharableLinkId });

      await queryRunner.manager
        .getRepository(SharableLinkAttendeesEntity)
        .insert(
          updateSharableLinkDto.attendees.map((attendee) => {
            return {
              userId: attendee,
              linkId: sharableLinkId,
            };
          }),
        );

      await queryRunner.manager.getRepository(SharableLinkEntity).update(
        { id: sharableLinkId },
        {
          title: updateSharableLinkDto.title ?? sharableLink.title,
          meetVia: updateSharableLinkDto.meetVia ?? sharableLink.meetVia,
          phoneNumber:
            updateSharableLinkDto.phoneNumber ?? sharableLink.phoneNumber,
          address: updateSharableLinkDto.address ?? sharableLink.address,
        },
      );

      await queryRunner.commitTransaction();

      return { message: 'Updated', status: 1 };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw new BadRequestException({ message: error.message });
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * @description `Get user sharable links`
   *
   * @param user - `Authorized user data`
   * @param pagination - `IPagination object(limit,offset)`
   *
   * @returns `Array of SharableLinkEntity and total count`
   */

  async findAll(
    user: User,
    pagination: IPaginate,
  ): Promise<IResponse<SharableLinkEntity[]>> {
    const [data, count] = await this.connection
      .getRepository(SharableLinkEntity)
      .createQueryBuilder('sharableLink')
      .addSelect([
        'attendees.id',
        'attuser.id',
        'attuser.email',
        'attuser.firstName',
        'attuser.lastName',
        'attuser.avatar',
      ])
      .addSelect([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.avatar',
      ])
      .addSelect([
        'slots.id',
        'slots.startDate',
        'slots.endDate',
        'slots.choosedBy',
        'slots.choosedByEmail',
      ])
      .leftJoin('sharableLink.attendees', 'attendees')
      .leftJoin(`attendees.user`, 'attuser')
      .innerJoin(`sharableLink.user`, 'user')
      .leftJoin(`sharableLink.slots`, 'slots')
      .where({ sharedBy: user.id })
      .limit(pagination.limit)
      .offset(pagination.offset)
      .getManyAndCount();
    return { data, metadata: { count } };
  }

  /**
   * @description `Get sharable link by id`
   * @param id - `ID of sharable link`
   * @returns `Sharable link entity data`
   */

  async findOne(id: string): Promise<IResponse<SharableLinkEntity>> {
    const data = await this.connection
      .getRepository(SharableLinkEntity)
      .createQueryBuilder('sharableLink')
      .addSelect([
        'attendees.id',
        'attuser.id',
        'attuser.email',
        'attuser.firstName',
        'attuser.lastName',
        'attuser.avatar',
      ])
      .addSelect([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.avatar',
      ])
      .addSelect([
        'slots.id',
        'slots.startDate',
        'slots.endDate',
        'slots.choosedBy',
        'slots.choosedByEmail',
      ])
      .leftJoin('sharableLink.attendees', 'attendees')
      .leftJoin(`attendees.user`, 'attuser')
      .innerJoin(`sharableLink.user`, 'user')
      .leftJoin(`sharableLink.slots`, 'slots')
      .where({ id })
      .getOne();
    return { data };
  }

  /**
   * @description `Select slot to make calendar event`
   *
   * @param user - `Authorized user data`
   * @param slotId - `ID of current slot`
   *
   * @returns `Created`
   */

  async selectSlot(
    user: User,
    slotId: string,
  ): Promise<IResponse<CalendarEvent>> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const slot = await queryRunner.manager
        .getRepository(SharableLinkSlotsEntity)
        .createQueryBuilder('slot')
        .addSelect('user.id')
        .innerJoinAndSelect('slot.link', 'link')
        .innerJoin('link.user', 'user')
        .where({ id: slotId })
        .getOne();

      /*       if (slot.link.user.id === user.id) {
        throw new BadRequestException({
          message: ErrorMessages.cantChooseOwnSlot,
        });
      } */

      if (slot.choosedBy || slot.choosedByEmail) {
        throw new BadRequestException({ message: ErrorMessages.slotIsBusy });
      }

      const schedulerUser = await queryRunner.manager
        .getRepository(User)
        .findOne({
          where: { id: slot.link.user.id },
          select: ['id', 'email', 'firstName', 'lastName', 'avatar'],
        });

      let meetLink: string;
      let meetingId: string;

      if (slot.link.meetVia === MeetViaEnum.Zoom) {
        meetLink = (
          await this.zoomService.createMeeting(schedulerUser, {
            start_time: slot.startDate,
            pre_schedule: true,
            meeting_invitees: [{ email: user.email }],
            waiting_room: true,
            type: 1,
            settings: {
              email_notification: true,
            },
          })
        ).data.join_url;
      }

      const schedulerUserCalendar = await queryRunner.manager
        .getRepository(Calendar)
        .findOne({
          owner: { id: schedulerUser.id },
          isPrimary: true,
        });

      const event = await this.calendarEventService.createUserCalendarEvent(
        schedulerUser,
        {
          title: slot.link.title,
          description: `Sharable link event with ${user.firstName} ${user.lastName}`,
          meetLink,
          phoneNumber: slot.link.phoneNumber,
          address: slot.link.address,
          start: moment(slot.startDate).format(),
          end: moment(slot.endDate).format(),
          syncWith: schedulerUserCalendar.calendarId,
          attendees: [user.email],
        },
      );

      await queryRunner.manager
        .getRepository(SharableLinkSlotsEntity)
        .update(
          { id: slotId },
          { choosedBy: user.id, meetingId, calendarEventId: event.id },
        );

      await queryRunner.commitTransaction();

      return { data: event };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw new BadRequestException({ message: error.message });
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * @description `Select sharable link for non-user persons`
   *
   * @param slotId - `ID of selectable slot`
   * @param body - `emai,name,phone and notes(optional)`
   *
   * @returns `Selected`
   */

  async selectSlotPublic(
    slotId: string,
    body: SelectSlotPublic,
  ): Promise<IResponse<CalendarEvent>> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const slot = await queryRunner.manager
        .getRepository(SharableLinkSlotsEntity)
        .createQueryBuilder('slot')
        .addSelect('user.id')
        .innerJoinAndSelect('slot.link', 'link')
        .innerJoin('link.user', 'user')
        .where({ id: slotId })
        .getOne();

      if (slot.choosedBy || slot.choosedByEmail) {
        throw new BadRequestException({ message: ErrorMessages.slotIsBusy });
      }

      const schedulerUser = await queryRunner.manager
        .getRepository(User)
        .findOne({
          where: { id: slot.link.user.id },
          select: ['id', 'email', 'firstName', 'lastName', 'avatar'],
        });

      const schedulerUserCalendar = await queryRunner.manager
        .getRepository(Calendar)
        .findOne({
          owner: { id: schedulerUser.id },
          isPrimary: true,
        });

      if (!schedulerUserCalendar) {
        throw new BadRequestException({
          message: ErrorMessages.calendarNotFound,
        });
      }

      let meetLink: string;
      let meetingId: string;

      if (slot.link.meetVia === MeetViaEnum.Zoom) {
        const zoomMeet = await this.zoomService.createMeeting(schedulerUser, {
          start_time: slot.startDate,
          pre_schedule: true,
          meeting_invitees: [{ email: body.email }],
          waiting_room: true,
          type: 1,
          settings: {
            email_notification: true,
          },
        });

        meetLink = zoomMeet.data.join_url;
        meetingId = zoomMeet.data.id.toString();
      } else if (slot.link.meetVia === MeetViaEnum.GMeet) {
        const gMeet = await this.calendarEventService.createGoogleMeetLink(
          schedulerUser,
          {
            start: moment(slot.startDate).format(),
            end: moment(slot.endDate).format(),
            calendarId: schedulerUserCalendar.id,
            attendees: [body.email],
          },
        );

        meetLink = gMeet.meetLink;
        meetingId = gMeet.meetingId;
      }

      const event = await this.calendarEventService.createUserCalendarEvent(
        schedulerUser,
        {
          title: slot.link.title,
          description: body.note
            ? `Note: ${body.note}
            `
            : '' + `Sharable link event with ${body.name}`,
          meetLink,
          phoneNumber:
            slot.link.meetVia === MeetViaEnum.InboundCall
              ? slot.link.phoneNumber
              : body.phoneNumber,
          address: slot.link.address,
          start: moment(slot.startDate).format(),
          end: moment(slot.endDate).format(),
          syncWith: schedulerUserCalendar.calendarId,
          attendees: [body.email],
        },
      );

      await queryRunner.manager.getRepository(SharableLinkSlotsEntity).update(
        { id: slotId },
        {
          choosedByEmail: body.email,
          meetingId,
          calendarEventId: event.id,
          metadata: {
            name: body.name,
            email: body.email,
            note: body.note,
            phoneNumber: body.phoneNumber,
          },
        },
      );

      await queryRunner.commitTransaction();

      return { data: event };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw new BadRequestException({ message: error.message });
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * @description `Cancel selected slot meeting`
   *
   * @param slotId - `ID of current timeslot`
   * @param body - `Reason of cancelation`
   *
   * @returns `Canceled`
   */

  async cancelMeeting(
    slotId: string,
    body: CancelMeetingDto,
  ): Promise<IResponseMessage> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const slot = await queryRunner.manager
        .getRepository(SharableLinkSlotsEntity)
        .createQueryBuilder('slot')
        .addSelect(['user.id', 'user.email'])
        .innerJoinAndSelect('slot.link', 'link')
        .innerJoin('link.user', 'user')
        .where({ id: slotId })
        .getOne();

      const schedulerUser = await queryRunner.manager
        .getRepository(User)
        .findOne({
          where: { id: slot.link.user.id },
          select: ['id', 'email', 'firstName', 'lastName', 'avatar'],
        });

      const calendar = await queryRunner.manager
        .getRepository(Calendar)
        .findOne({
          owner: { id: schedulerUser.id },
          isPrimary: true,
        });

      if (slot.link.meetVia === MeetViaEnum.GMeet) {
        await this.calendarEventService.deleteGoogleMeetLink(
          schedulerUser,
          slot.meetingId,
          schedulerUserCalendar.calendarId,
        );
      } else if (slot.link.meetVia === MeetViaEnum.Zoom) {
        await this.zoomService.deleteMeeting(schedulerUser, slot.meetingId);
      }

      if (slot.calendarEventId) {
        await this.calendarEventService.deleteUserCalendarEvent(
          schedulerUser,
          slot.calendarEventId,
        );
      }

      await queryRunner.manager.getRepository(SharableLinkSlotsEntity).update(
        { id: slot.id },
        {
          meetingId: null,
          calendarEventId: null,
          choosedBy: null,
          choosedByEmail: null,
        },
      );

      this.mailService.send({
        from: this.configService.get<string>('NO_REPLY_EMAIL'),
        to: slot.link.user.email,
        subject: 'Event Canceled',
        text: `Your meeting in ${slot.startDate} was canceled
        Reason: ${body.reason}`,
      });

      await queryRunner.commitTransaction();

      return { message: 'Canceled', status: 201 };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw new BadRequestException({ message: error.message });
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * @description `Private method that deletes calendar event for both cancellaion and scheduling events`
   *
   * @param slot - `Selected slot`
   * @param user - `Authorized user data`
   * @param calendar - `Calendar of Authorized user`
   *
   * @returns `Deleted`
   */

  private async _deleteTimeslotEvents(
    slot: SharableLinkSlotsEntity,
    user: User,
    calendar: Calendar,
  ): Promise<IResponseMessage> {
    if (slot.link.meetVia === MeetViaEnum.GMeet) {
      await this.calendarEventService.deleteGoogleMeetLink(
        user,
        slot.meetingId,
        calendar.calendarId,
      );
    } else if (slot.link.meetVia === MeetViaEnum.Zoom) {
      await this.zoomService.deleteMeeting(user, slot.meetingId);
    }

    await this.calendarEventService.deleteUserCalendarEvent(
      user,
      slot.calendarEventId,
    );

    return { message: 'Deleted', status: HttpStatus.ACCEPTED };
  }

  /**
   * @description `Reschedule selected timeslot event`
   *
   * @param slotId - `Selected slot id`
   * @param body - `reason and new slot id`
   *
   * @returns `Rescheduled`
   */

  async rescheduleMeeting(
    slotId: string,
    body: RescheduleMeetingDto,
  ): Promise<IResponseMessage> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const slot = await queryRunner.manager
        .getRepository(SharableLinkSlotsEntity)
        .createQueryBuilder('slot')
        .addSelect(['user.id', 'user.email'])
        .innerJoinAndSelect('slot.link', 'link')
        .innerJoin('link.user', 'user')
        .where({ id: slotId })
        .getOne();

      const newSlot = await queryRunner.manager
        .getRepository(SharableLinkSlotsEntity)
        .createQueryBuilder('slot')
        .addSelect(['user.id', 'user.email'])
        .innerJoinAndSelect('slot.link', 'link')
        .innerJoin('link.user', 'user')
        .where({ id: body.newSlotId })
        .andWhere({ linkId: slot.link.id })
        .getOne();

      const email = slot.user ? slot.user.email : slot.metadata.email;

      const schedulerUser = await queryRunner.manager
        .getRepository(User)
        .findOne({
          where: { id: slot.link.user.id },
          select: ['id', 'email', 'firstName', 'lastName', 'avatar'],
        });

      const calendar = await queryRunner.manager
        .getRepository(Calendar)
        .findOne({
          owner: { id: schedulerUser.id },
          isPrimary: true,
        });

      await this._deleteTimeslotEvents(slot, schedulerUser, calendar);

      let meetLink: string;
      let meetingId: string;

      if (slot.link.meetVia === MeetViaEnum.Zoom) {
        const zoomMeet = await this.zoomService.createMeeting(schedulerUser, {
          start_time: newSlot.startDate,
          pre_schedule: true,
          meeting_invitees: [{ email: email }],
          waiting_room: true,
          type: 1,
          settings: {
            email_notification: true,
          },
        });

        meetLink = zoomMeet.data.join_url;
        meetingId = zoomMeet.data.id.toString();
      } else if (slot.link.meetVia === MeetViaEnum.GMeet) {
        const gMeet = await this.calendarEventService.createGoogleMeetLink(
          schedulerUser,
          {
            start: moment(newSlot.startDate).format(),
            end: moment(newSlot.endDate).format(),
            calendarId: calendar.id,
            attendees: [email],
          },
        );

        meetLink = gMeet.meetLink;
        meetingId = gMeet.meetingId;
      }

      const event = await this.calendarEventService.createUserCalendarEvent(
        schedulerUser,
        {
          title: slot.link.title,
          description: `Your meeting of ${slot.startDate} - ${
            slot.endDate
          } was rescheduled
          Reason: ${body.reason}
          Here are the details of new event with ${
            slot.user
              ? slot.user.firstName + ' ' + slot.user.lastName
              : slot.metadata.name
          }`,
          meetLink,
          phoneNumber: slot.link.phoneNumber,
          address: slot.link.address,
          start: moment(newSlot.startDate).format(),
          end: moment(newSlot.endDate).format(),
          syncWith: calendar.calendarId,
          attendees: [email],
        },
      );

      await Promise.all([
        queryRunner.manager.getRepository(SharableLinkSlotsEntity).update(
          { id: slotId },
          {
            choosedByEmail: null,
            choosedBy: null,
            meetingId: null,
            calendarEventId: null,
            metadata: null,
          },
        ),
        queryRunner.manager.getRepository(SharableLinkSlotsEntity).update(
          { id: body.newSlotId },
          {
            choosedBy: slot.user ? slot.user.id : null,
            choosedByEmail: slot.metadata.email ?? null,
            meetingId,
            calendarEventId: event.id,
            metadata: slot.metadata,
          },
        ),
      ]);

      await queryRunner.commitTransaction();

      return { message: 'Rescheduled', status: 201 };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw new BadRequestException({ message: error.message });
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * @description `Check slot Avaiability`
   * @private `This is a private method`
   * @param user - `Authorized user data`
   * @param slots - `Array of SharableLinkSlot update`
   */

  private async _checkSlotAvailability(
    user: User,
    slots: SharableLinkSlot[],
  ): Promise<void> {
    const checkAvailability = await this.calendarEventsRepo.count({
      where: [
        ...slots.map((slot) => {
          return {
            start: Between(slot.startDate, slot.endDate),
            owner: { id: user.id },
          };
        }),
        ...slots.map((slot) => {
          return {
            end: Between(slot.startDate, slot.endDate),
            owner: { id: user.id },
          };
        }),
      ],
    });

    if (checkAvailability) {
      throw new BadRequestException({ message: ErrorMessages.slotIsBusy });
    }
  }

  /**
   * @description `Delete sharable link by ID`
   *
   * @param user - `Authroized user data`
   * @param sharableLinkId - `ID of sharable link`
   *
   * @returns `Deleted`
   */

  async remove(user: User, sharableLinkId: string): Promise<IResponseMessage> {
    const sharableLink = (await this.findOne(sharableLinkId)).data;

    if (!sharableLink || sharableLink.sharedBy !== user.id) {
      throw new NotFoundException({
        message: ErrorMessages.sharableLinkNotFound,
      });
    }

    await this.connection
      .getRepository(SharableLinkEntity)
      .delete({ id: sharableLinkId });

    return { message: `Deleted`, status: 1 };
  }
}
