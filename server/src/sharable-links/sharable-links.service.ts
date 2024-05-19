import * as moment from 'moment';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Connection, Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';

import { CalendarEvent } from 'src/calendar/calendar-event/entities/calendarEvent.entity';
import { CalendarEventService } from 'src/calendar/calendar-event/calendar-event.service';
import { SharableLinkAttendeesEntity } from './entities/sharable-link-attendees.entity';
import { SharableLinkSlotsEntity } from './entities/sharable-link-slots.entity';
import { Calendar } from 'src/calendar/calendar-event/entities/calendar.entity';
import { ErrorMessages } from 'src/components/constants/error.messages';
import { CreateSharableLinkDto } from './dto/create-sharable-link.dto';
import { SharableLinkEntity } from './entities/sharable-link.entity';
import { IPaginate } from './interfaces/sharable-links.interface';
import { ZoomService } from 'src/integrations/zoom/zoom.service';
import { MeetViaEnum } from './enums/sharable-links.enum';
import {
  IResponse,
  IResponseMessage,
} from 'src/components/interfaces/response.interface';
import { User } from '@user/entity/user.entity';

@Injectable()
export class SharableLinksService {
  constructor(
    @InjectRepository(CalendarEvent)
    private readonly calendarEventsRepo: Repository<CalendarEvent>,
    private readonly connection: Connection,
    private readonly calendarEventService: CalendarEventService,
    private readonly zoomService: ZoomService,
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
    const checkAvailability = await this.calendarEventsRepo.count({
      where: [
        ...createSharableLinkDto.slots.map((slot) => {
          return {
            start: Between(slot.startDate, slot.endDate),
            owner: { id: user.id },
          };
        }),
        ...createSharableLinkDto.slots.map((slot) => {
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

    const sharableLinkId = randomUUID();
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.getRepository(SharableLinkEntity).insert({
        id: sharableLinkId,
        sharedBy: user.id,
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

      return { message: 'Created', status: 1 };
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

  async selectSlot(user: User, slotId: string) {
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

      if (slot.choosedBy) {
        throw new BadRequestException({ message: ErrorMessages.slotIsBusy });
      }

      const schedulerUser = await queryRunner.manager
        .getRepository(User)
        .findOne({
          where: { id: slot.link.user.id },
          select: ['id', 'email', 'firstName', 'lastName', 'avatar'],
        });

      let meetLink: string;

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
          start: moment(slot.startDate).format(),
          end: moment(slot.endDate).format(),
          syncWith: schedulerUserCalendar.calendarId,
          attendees: [user.email],
        },
      );

      await queryRunner.commitTransaction();

      return event;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw new BadRequestException({ message: error.message });
    } finally {
      await queryRunner.release();
    }
  }

  remove(id: number) {
    return `This action removes a #${id} sharableLink`;
  }
}
