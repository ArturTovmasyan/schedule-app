import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CalendarToken } from '../calendar-permissions/entity/calendarToken.entity';
import { EntityManager, IsNull, Not, Repository } from 'typeorm';
import { ClientsCredentialsService } from '../clients-credentials/clients-credentials.service';
import { CalendarTypeEnum } from '../calendar-permissions/enums/calendarType.enum';
import 'isomorphic-fetch';
import { Calendar } from './entities/calendar.entity';
import { User } from '@user/entity/user.entity';
import { CalendarEvent } from './entities/calendarEvent.entity';
import { EventTypeEnum } from './enums/eventType.enum';
import CreateEventDto from './dto/createEvent.dto';
import { transactionManagerWrapper } from '../../components/helpers/dbTransactionManager';
import UpdateEventDto from './dto/updateEvent.dto';
import { CalendarWebhookChannel } from './entities/calendarWebhookChannel.entity';
import { ConfigService } from '@nestjs/config';
import { ErrorMessages } from 'src/components/constants/error.messages';
import { randomUUID } from 'crypto';
import {
    FirstWeekDaysAbbreviateEnum,
    FirstWeekDaysOutlookAbbreviateEnum,
    GoogleWeekDaysEnum,
    WeekDaysAbbreviateEnum,
    WeekDaysEnum,
} from './enums/weekDays.enum';
import {
    GoogleIndexOfWeekEnum,
    IndexOfWeekToNumberEnum,
} from './enums/indexOfWeek.enum';
import { EventRecurrenceTypeEnum } from './enums/eventRecurrenceType.enum';
import { RRule } from 'rrule';
import { getEnumKeyByEnumValue } from '../../components/helpers/getEnumKeyByEnumValue';
import moment = require('moment');

@Injectable()
export class CalendarEventService {
<<<<<<< HEAD
    constructor(
        @InjectRepository(CalendarToken)
        private readonly calendarTokenRepository: Repository<CalendarToken>,
        @InjectRepository(Calendar)
        private readonly calendarRepository: Repository<Calendar>,
        @InjectRepository(CalendarEvent)
        private readonly calendarEventRepository: Repository<CalendarEvent>,
        @InjectRepository(CalendarWebhookChannel)
        private readonly calendarWebhookChannelRepository: Repository<CalendarWebhookChannel>,
        private readonly clientsCredentials: ClientsCredentialsService,
        private readonly configService: ConfigService,
    ) {}
=======
  constructor(
    @InjectRepository(CalendarToken)
    private readonly calendarTokenRepository: Repository<CalendarToken>,
    @InjectRepository(CalendarEvent)
    private readonly calendarEventRepository: Repository<CalendarEvent>,
    @InjectRepository(CalendarWebhookChannel)
    private readonly calendarWebhookChannelRepository: Repository<CalendarWebhookChannel>,
    @InjectRepository(Calendar)
    private readonly calendarRepository: Repository<Calendar>,
    private readonly calendarService: CalendarService,
    private readonly connection: Connection,
  ) {}
>>>>>>> c8c9b63 (add api to  sync all calendar events)

    async getCalendarsFromGoogle(
        user: User,
        token: CalendarToken,
        manager?: EntityManager,
    ) {
        return transactionManagerWrapper(
            manager,
            this.calendarTokenRepository,
            async (manager) => {
                const { accessToken } = token;

                const googleCalendar = await this.getGoogleCredentials(accessToken);

                const calendarList = await googleCalendar.calendarList.list();

                const calendarSerializedList = calendarList.data.items
                    .filter((item) => {
                        return item.primary;
                    })
                    .map((item) => {
                        const calendar = new Calendar();
                        calendar.calendarId = item.id;
                        calendar.summary = item.summary;
                        calendar.isPrimary = item.primary ? item.primary : false;
                        calendar.calendarType = CalendarTypeEnum.GoogleCalendar;
                        calendar.owner = user;
                        calendar.calendarToken = token;
                        return calendar;
                    });

<<<<<<< HEAD
                return await manager
                    .getRepository(Calendar)
                    .save(calendarSerializedList[0]);
=======
        return await manager
          .getRepository(Calendar)
          .save(await calendarSerializedList[0]);
      },
    );
  }

  async getCalendarsFromOutlook(
    user: User,
    token: CalendarToken,
    manager?: EntityManager,
  ) {
    return transactionManagerWrapper(
      manager,
      this.calendarTokenRepository,
      async (manager) => {
        const eventManager = await this.calendarService.initManager(
          token.accessToken,
          CalendarTypeEnum.Office365Calendar,
        );

        const calendarList = await eventManager.getAllCalendars();

        const calendarSerializedList = calendarList
          .filter((item) => {
            return item.isDefaultCalendar;
          })
          .map(async (item) => {
            const existedCalendar = await manager
              .getRepository(Calendar)
              .findOne({
                where: { calendarId: item.id },
              });
            const calendar = new Calendar();
            calendar.id = existedCalendar ? existedCalendar.id : randomUUID();
            calendar.calendarId = item.id;
            calendar.summary = token.ownerEmail;
            calendar.isPrimary = item.isDefaultCalendar
              ? item.isDefaultCalendar
              : false;
            calendar.calendarType = CalendarTypeEnum.Office365Calendar;
            calendar.owner = user;
            calendar.calendarToken = token;
            return calendar;
          });

        return await manager
          .getRepository(Calendar)
          .save(await calendarSerializedList[0]);
      },
    );
  }

  async syncAllCalendarEvents(user: User) {
    const calendars = await this.calendarRepository.find({
      owner: { id: user.id },
    });
    calendars.forEach(async (calendar) => {
      try {
        if (calendar.calendarType == CalendarTypeEnum.GoogleCalendar) {
          await this.syncGoogleCalendarEventList(user, calendar);
        } else if (
          calendar.calendarType == CalendarTypeEnum.Office365Calendar
        ) {
          await this.syncOutlookCalendarEventList(user, calendar);
        }
      } catch (e) {
        console.log(e);
      }
    });
    return { data: true };
  }

  async syncGoogleCalendarEventList(
    user: User,
    calendar: Calendar,
    manager?: EntityManager,
  ) {
    return transactionManagerWrapper(
      manager,
      this.calendarTokenRepository,
      async (manager) => {
        const cal = await manager.getRepository(Calendar).findOne({
          where: { id: calendar.id },
          relations: ['calendarToken'],
        });
        const token = cal.calendarToken;
        if (!token) {
          throw new NotFoundException(
            'You have not calendar-event access token',
          );
        }

        const { accessToken } = token;

        const eventsFromDb = await manager.getRepository(CalendarEvent).find({
          owner: { id: user.id },
          externalId: Not(IsNull()),
          eventType: EventTypeEnum.GoogleCalendarEvent,
        });

        const eventManager = await this.calendarService.initManager(
          accessToken,
        );
        const events = await eventManager.getAllEvents(
          calendar.calendarId,
          moment().subtract(3, 'months').format('YYYY-MM-DDTHH:mm:ss.sssZ'),
          'GMT',
        );

        const serializedEvents = events.map((item) => {
          const event = new CalendarEvent();
          event.externalId = item.id;
          event.calendar = calendar;
          event.eventType = EventTypeEnum.GoogleCalendarEvent;
          event.owner = user;
          event.title = item.summary || null;
          event.entanglesLocation = null;
          event.attendees = item.attendees || [];
          event.createdOn = item.created
            ? new Date(item.created)
            : new Date(Date.now());
          event.updatedOn = item.updated
            ? new Date(item.updated)
            : new Date(Date.now());
          event.description = item.description || null;
          event.allDay = item.start.date !== undefined; // allDay events format in google (yyyy-mm-dd)

          if (event.allDay) {
            event.start = moment(item.start.date)
              .set({
                hour: 0,
                minute: 0,
                second: 0,
                millisecond: 0,
              })
              .toDate();
            event.end = moment(item.start.date)
              .set({
                hour: 23,
                minute: 59,
                second: 59,
                millisecond: 0,
              })
              .toDate();
          } else {
            event.start = item.start?.dateTime
              ? new Date(item.start.dateTime)
              : null;
            event.end = item.end?.dateTime ? new Date(item.end.dateTime) : null;
          }

          if (item.recurrence) {
            this.serializedGoogleEventRecurrence(event, item);
          }

          return event;
        });

        const delta = this.compareEvents(
          eventsFromDb,
          serializedEvents,
          'externalId',
        );

        if (delta.changed.length > 0) {
          const externalId = delta.changed[0].externalId;

          await manager
            .getRepository(CalendarEvent)
            .createQueryBuilder()
            .update()
            .set(delta.changed[0])
            .where('"calendar_event"."externalId" = :externalId', {
              externalId: externalId,
            })
            .andWhere('"calendar_event"."eventType" = :eventType', {
              eventType: EventTypeEnum.GoogleCalendarEvent,
            })
            .execute();
        }

        if (delta.deleted.length > 0) {
          const externalId = delta.deleted[0].externalId;

          await manager
            .createQueryBuilder()
            .delete()
            .from(CalendarEvent)
            .where('"calendar_event"."externalId" = :externalId', {
              externalId: externalId,
            })
            .andWhere('"calendar_event"."eventType" = :eventType', {
              eventType: EventTypeEnum.GoogleCalendarEvent,
            })
            .execute();
        }

        return await manager.getRepository(CalendarEvent).save(delta.added);
      },
    );
  }

  async syncOutlookCalendarEventList(
    user: User,
    calendar: Calendar,
    manager?: EntityManager,
  ) {
    return transactionManagerWrapper(
      manager,
      this.calendarTokenRepository,
      async (manager) => {
        const cal = await manager.getRepository(Calendar).findOne({
          where: { id: calendar.id },
          relations: ['calendarToken'],
        });
        const token = cal.calendarToken;

        if (!token) {
          throw new NotFoundException(
            'You have not calendar-event access token',
          );
        }

        const eventsFromDb = await manager.getRepository(CalendarEvent).find({
          owner: { id: user.id },
          externalId: Not(IsNull()),
          eventType: EventTypeEnum.Office365CalendarEvent,
        });

        const eventManager = await this.calendarService.initManager(
          token.accessToken,
          CalendarTypeEnum.Office365Calendar,
        );
        const events = await eventManager.getAllEvents(
          calendar.calendarId,
          '',
          'GMT',
        );

        const serializedEvents = events.value.map((item) => {
          const event = new CalendarEvent();
          event.externalId = item.id;
          event.calendar = calendar;
          event.eventType = EventTypeEnum.Office365CalendarEvent;
          event.owner = user;

          event.title = item.subject || null;
          event.entanglesLocation = null;
          event.createdOn = new Date(item.createdDateTime);
          event.updatedOn = new Date(item.lastModifiedDateTime);
          event.description = item.bodyPreview || null;
          event.allDay = item.isAllDay || false;
          event.attendees = this.mapOutlookAttendees(item.attendees);

          if (event.allDay) {
            event.start = moment(item.start.dateTime)
              .set({
                hour: 0,
                minute: 0,
                second: 0,
                millisecond: 0,
              })
              .toDate();
            event.end = moment(item.start.dateTime)
              .set({
                hour: 23,
                minute: 59,
                second: 59,
                millisecond: 0,
              })
              .toDate();
          } else {
            event.start = item.start.dateTime
              ? new Date(item.start.dateTime)
              : null;
            event.end = item.end.dateTime ? new Date(item.end.dateTime) : null;
          }

          if (item.recurrence) {
            this.serializedOutlookEventRecurrence(event, item);
          }

          return event;
        });

        const delta = this.compareEvents(
          eventsFromDb,
          serializedEvents,
          'externalId',
        );
        console.log(delta.changed.length);
        if (delta.changed.length > 0) {
          const externalId = delta.changed[0].externalId;

          await manager
            .getRepository(CalendarEvent)
            .createQueryBuilder()
            .update()
            .set(delta.changed[0])
            .where('"calendar_event"."externalId" = :externalId', {
              externalId: externalId,
            })
            .andWhere('"calendar_event"."eventType" = :eventType', {
              eventType: EventTypeEnum.Office365CalendarEvent,
            })
            .execute();
        }

        if (delta.deleted.length > 0) {
          const externalId = delta.deleted[0].externalId;

          await manager
            .createQueryBuilder()
            .delete()
            .from(CalendarEvent)
            .where('"calendar_event"."externalId" = :externalId', {
              externalId: externalId,
            })
            .andWhere('"calendar_event"."eventType" = :eventType', {
              eventType: EventTypeEnum.Office365CalendarEvent,
            })
            .execute();
        }

        return await manager.getRepository(CalendarEvent).save(delta.added);
      },
    );
  }

  async getUserCalendarEvents(userId: string, query: TimeIntervalDto) {
    const commonEvents = await this.calendarEventRepository
      .createQueryBuilder('calendarEvent')
      .leftJoinAndSelect('calendarEvent.calendar', 'calendar')
      .where('"calendarEvent"."ownerId" = :id', { id: userId })
      .andWhere('"start" > :start', { start: query.startDate })
      .andWhere('"end" < :end', { end: query.dateEnd })
      .andWhere('"recurrenceType" is null')
      .orderBy('start')
      .getMany();

    const recurringEventsFromDb = await this.calendarEventRepository
      .createQueryBuilder('calendarEvent')
      .leftJoinAndSelect('calendarEvent.calendar', 'calendar')
      .where('"calendarEvent"."ownerId" = :id', { id: userId })
      .andWhere('"recurrenceType" is not null')
      .orderBy('start')
      .getMany();

    return this.joinCommonAndRecurrenceEvents(
      commonEvents,
      recurringEventsFromDb,
      query,
    );
  }

  async getEventDetail(eventId: string): Promise<CalendarEvent> {
    return this.calendarEventRepository
      .createQueryBuilder('calendarEvent')
      .leftJoinAndSelect('calendarEvent.calendar', 'calendar')
      .where('"calendarEvent"."id" = :id', { id: eventId })
      .getOne();
  }

  async createUserCalendarEvent(user: User, eventDto: CreateEventDto) {
    return this.calendarTokenRepository.manager.transaction(async (manager) => {
      const event = await this.getEventFromThirdPartyResponse(
        manager,
        user,
        eventDto,
      );
      return await manager.getRepository(CalendarEvent).save(event);
    });
  }

  async createGoogleMeetLink(user: User, body: GoogleMeetLinkDto) {
    return this.calendarTokenRepository.manager.transaction(async (manager) => {
      const tokens = await this.getTokens(user, manager);
      const googleToken = tokens.googleToken;

      const calendar = await manager.getRepository(Calendar).findOne({
        where: { id: body.calendarId, owner: user.id },
      });

      if (!calendar) {
        throw new BadRequestException({
          message: ErrorMessages.calendarNotFound,
        });
      }
      // TODO: check
      const eventManager = await this.calendarService.initManager(
        googleToken.accessToken,
      );
      const attendeeData = body.attendees.map((attendee) => {
        return {
          email: attendee,
          optional: false,
        };
      });

      const eventData = {
        conferenceDataVersion: 1,
        sendNotifications: true,
        calendarId: calendar.calendarId,
        requestBody: {
          summary: 'Share Meet Link',
          start: { dateTime: body.start, timeZone: 'GMT' },
          end: { dateTime: body.end, timeZone: 'GMT' },
          attendees: attendeeData,
          conferenceData: {
            createRequest: {
              conferenceSolutionKey: {
                type: 'hangoutsMeet',
              },
              requestId: randomUUID(),
>>>>>>> c8c9b63 (add api to  sync all calendar events)
            },
<<<<<<< HEAD
=======
          },
        },
      };

      const googleEvent = await eventManager.saveEvent(eventData, false, null);

      return {
        meetLink: googleEvent.hangoutLink ?? '',
        meetingId: googleEvent.id,
      };
    });
  }

  /**
   * @description `Delete Google meet link`
   *
   * @param user - `Authorized user data`
   * @param meetingId - `ID of google meeting`
   * @param calendarId - `ID of primary calendar`
   *
   * @returns `Deleted`
   */

  async deleteGoogleMeetLink(
    user: User,
    meetingId: string,
    calendarId: string,
  ): Promise<IResponseMessage> {
    const tokens = await this.getTokens(user, this.connection.manager);

    const eventManager = await this.calendarService.initManager(
      tokens.googleToken.accessToken,
    );
    // TODO: check why deleteing event?
    await eventManager.deleteEvent(calendarId, meetingId, '');

    return { message: 'Deleted', status: HttpStatus.ACCEPTED };
  }

  async deleteUserCalendarEvent(
    user: User,
    eventId: string,
    message: string | null = null,
  ) {
    return this.calendarTokenRepository.manager.transaction(async (manager) => {
      const calendarEventRepo = manager.getRepository(CalendarEvent);

      const event = await calendarEventRepo
        .createQueryBuilder('calendarEvent')
        .leftJoinAndSelect('calendarEvent.calendar', 'calendar')
        .where({ id: eventId, owner: { id: user.id } })
        .getOne();

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      const tokens = await this.getTokens(user, manager);
      const googleToken = tokens.googleToken;
      const outlookToken = tokens.outlookToken;

      const eventDeleters = [];

      if (event.calendar.calendarType == CalendarTypeEnum.GoogleCalendar) {
        const eventManager = await this.calendarService.initManager(
          googleToken.accessToken,
>>>>>>> 831cabe (feat: allow user to cancel event)
        );
    }

    async getCalendarsFromOutlook(
        user: User,
        token: CalendarToken,
        manager?: EntityManager,
    ) {
        return transactionManagerWrapper(
            manager,
            this.calendarTokenRepository,
            async (manager) => {
                const { accessToken } = token;

                const client = await this.getOutlookCredentials(accessToken);

                const calendarList = await client
                    .api('https://graph.microsoft.com/v1.0/me/calendars/')
                    .get();

                const calendarSerializedList = calendarList.value
                    .filter((item) => {
                        return item.isDefaultCalendar;
                    })
                    .map((item) => {
                        const calendar = new Calendar();
                        calendar.calendarId = item.id;
                        calendar.summary = token.ownerEmail;
                        calendar.isPrimary = item.isDefaultCalendar
                            ? item.isDefaultCalendar
                            : false;
                        calendar.calendarType = CalendarTypeEnum.Office365Calendar;
                        calendar.owner = user;
                        calendar.calendarToken = token;
                        return calendar;
                    });

                return await manager
                    .getRepository(Calendar)
                    .save(calendarSerializedList[0]);
            },
        );
    }

<<<<<<< HEAD
    async syncGoogleCalendarEventList(
        user: User,
        calendar: Calendar,
        manager?: EntityManager,
    ) {
        return transactionManagerWrapper(
            manager,
            this.calendarTokenRepository,
            async (manager) => {
                const cal = await manager.getRepository(Calendar).findOne({
                    where: { id: calendar.id },
                    relations: ['calendarToken'],
                });
                const token = cal.calendarToken;
                if (!token) {
                    throw new NotFoundException(
                        'You have not calendar-event access token',
                    );
                }
=======
        if (gEvent) {
          eventDeleters.push(async () => {
            await eventManager.deleteEvent(
              event.calendar.calendarId,
              event.externalId,
              message,
            );
          });
        }
      }
>>>>>>> 831cabe (feat: allow user to cancel event)

                const { accessToken } = token;

<<<<<<< HEAD
                return await manager.getRepository(CalendarEvent).save(delta.added);
            });
=======
        const oEvent = await eventManager.getEvent(
          event.calendar.calendarId,
          event.externalId,
        );
        if (oEvent) {
          eventDeleters.push(async () => {
            await eventManager.deleteEvent(
              event.calendar.calendarId,
              event.externalId,
              message,
            );
          });
        }
      }
>>>>>>> 831cabe (feat: allow user to cancel event)

        const cal = await calendar.calendarList.list();

        const events = await calendar.events.list({
            calendarId: cal.data.items[0].id,
            timeZone: 'GMT',
        });

        const tasks = await calendar.acl.list({
            calendarId: cal.data.items[0].id,
        });
    }
    async getFromMS(userId: string) {
        const { accessToken } = await this.calendarTokenRepository.findOne({
            owner: { id: userId },
            calendarType: CalendarTypeEnum.Office365Calendar,
        });

        const client = graph.Client.init({
            authProvider: (done) => {
                done(null, accessToken);
            },
        });
        const calendars = await client
            .api('https://graph.microsoft.com/v1.0/me/calendars/')
            .get();

        const event = await client
            .api(`https://graph.microsoft.com/v1.0/me/calendar/events`)
            .get();
    }

    async createUserCalendarEvent(user: User, eventBody: CreateEventDto) {
        return this.calendarTokenRepository.manager.transaction(async (manager) => {
            let outlookEventId = '';
            let googleEventId = '';
            let creatorFromGoogle = '';
            let creatorFromOutlook = '';
            const tokens = await this.getTokens(user, manager);
            const googleToken = tokens.googleToken;
            const outlookToken = tokens.outlookToken;
            const eventSavers = [];

            const calendar = await manager.getRepository(Calendar).findOne({
                owner: { id: user.id },
                calendarId: eventBody.syncWith,
            });

            if (!calendar) {
                throw new BadRequestException({
                    message: ErrorMessages.calendarNotFound,
                });
            }

            if (calendar.calendarType === CalendarTypeEnum.GoogleCalendar) {
                const googleAccessToken = googleToken.accessToken;
                const googleCalendarClient = await this.getGoogleCredentials(
                    googleAccessToken,
                );

                async function saveEventGoogle() {
                    const attendeeData = eventBody.attendees.map((attendee) => {
                        return {
                            email: attendee,
                            optional: false,
                        };
                    });

                    eventBody.optionalAttendees.map((attendee) => {
                        attendeeData.push({ email: attendee, optional: true });
                    });

                    const eventData = {
                        conferenceDataVersion: 1,
                        sendNotifications: true,
                        calendarId: calendar.calendarId,
                        requestBody: {
                            summary: eventBody.title,
                            description: `
              Attached links
              ${eventBody.meetLink}
              
              ${eventBody.description}`,
                            start: { dateTime: eventBody.start, timeZone: 'GMT' },
                            end: { dateTime: eventBody.end, timeZone: 'GMT' },
                            attendees: attendeeData,
                        },
                    };

                    if (!eventBody.meetLink) {
                        Object.assign(eventData.requestBody, {
                            conferenceData: {
                                createRequest: {
                                    requestId: randomUUID(),
                                },
                            },
                        });
                    }

                    const googleEventCreateRes = await googleCalendarClient.events.insert(
                        eventData,
                    );

                    googleEventId = googleEventCreateRes.data.id;
                    creatorFromGoogle = googleEventCreateRes.data.creator.email;
                }

                eventSavers.push(saveEventGoogle);
            }

            if (calendar.calendarType === CalendarTypeEnum.OutlookPlugIn) {
                const outlookAccessToken = outlookToken.accessToken;

                const outlookCalendarClient = await this.getOutlookCredentials(
                    outlookAccessToken,
                );

                async function saveEventOutlook() {
                    const attendeeData = eventBody.attendees.map((attendee) => {
                        return {
                            emailAddress: {
                                address: attendee,
                            },
                            type: 'required',
                        };
                    });

                    eventBody.optionalAttendees.map((attendee) => {
                        attendeeData.push({
                            emailAddress: {
                                address: attendee,
                            },
                            type: 'optional',
                        });
                    });

                    const outlookEventCreateRes = await outlookCalendarClient
                        .api(`/me/calendars/${calendar.calendarId}/events`)
                        .post({
                            subject: eventBody.title,
                            bodyPreview: eventBody.description,
                            body: {
                                content: `
                Attached links
                ${eventBody.meetLink}
                
                ${eventBody.description}`,
                            },
                            attendees: attendeeData,
                            start: { dateTime: eventBody.start, timeZone: 'GMT' },
                            end: { dateTime: eventBody.end, timeZone: 'GMT' },
                        });

                    outlookEventId = outlookEventCreateRes.id;
                    creatorFromOutlook =
                        outlookEventCreateRes.organizer.emailAddress.address;
                }

                eventSavers.push(saveEventOutlook);
            }

            await Promise.all(eventSavers.map((saver) => saver()));

            const event = new CalendarEvent();
            event.googleId = googleEventId || null;
            event.outlookId = outlookEventId || null;
            event.eventType = EventTypeEnum.EntanglesCalendarEvent;
            event.owner = user;
            event.start = eventBody.start ? new Date(eventBody.start) : null;
            event.end = eventBody.end ? new Date(eventBody.end) : null;
            event.title = eventBody.title || null;
            event.creator = user.email || null;
            event.creatorFromGoogle = creatorFromGoogle || null;
            event.creatorFromOutlook = creatorFromOutlook || null;
            event.meetLink = eventBody.meetLink || null;
            event.description = eventBody.description || null;

            return await manager.getRepository(CalendarEvent).save(event);
        });
    }

    async deleteUserCalendarEvent(user: User, eventId: string) {
        return this.calendarTokenRepository.manager.transaction(async (manager) => {
            const calendarEventRepo = manager.getRepository(CalendarEvent);

            const event = await calendarEventRepo.findOne({ where: { id: eventId } });

            if (!event) {
                throw new NotFoundException('Event not found');
            }

            const tokens = await this.getTokens(user, manager);
            const googleToken = tokens.googleToken;
            const outlookToken = tokens.outlookToken;

            const eventDeleters = [];

            if (googleToken) {
                const googleAccessToken = googleToken.accessToken;
                const googleCalendarClient = await this.getGoogleCredentials(
                    googleAccessToken,
                );
                const googleLocalPrimaryCalendar = await manager
                    .getRepository(Calendar)
                    .findOne({
                        owner: { id: user.id },
                        calendarType: CalendarTypeEnum.GoogleCalendar,
                        isPrimary: true,
                    });

                async function googleEventDeleter() {
                    await googleCalendarClient.events.delete({
                        calendarId: googleLocalPrimaryCalendar.calendarId,
                        eventId: event.googleId,
                    });
                }

                eventDeleters.push(googleEventDeleter);
            }

            if (outlookToken) {
                const outlookAccessToken = outlookToken.accessToken;

                const outlookCalendarClient = await this.getOutlookCredentials(
                    outlookAccessToken,
                );

                const outlookLocalPrimaryCalendar = await manager
                    .getRepository(Calendar)
                    .findOne({
                        owner: { id: user.id },
                        calendarType: CalendarTypeEnum.Office365Calendar,
                        isPrimary: true,
                    });

                async function outlookEventDeleter() {
                    await outlookCalendarClient
                        .api(
                            `/me/calendars/${outlookLocalPrimaryCalendar.calendarId}/events/${event.outlookId}`,
                        )
                        .delete();
                }

                eventDeleters.push(outlookEventDeleter);
            }

            await Promise.all(eventDeleters.map((saver) => saver()));

            return await manager
                .getRepository(CalendarEvent)
                .delete({ id: event.id });
        });
    }

    async updateUserCalendarEvent(
        user: User,
        eventBody: UpdateEventDto,
        eventId: string,
    ) {
        return this.calendarTokenRepository.manager.transaction(async (manager) => {
            const calendarEventRepo = manager.getRepository(CalendarEvent);

            const eventOld = await calendarEventRepo.findOne({
                where: { id: eventId },
            });

            if (!eventOld) {
                throw new NotFoundException('Event not found');
            }

            const tokens = await this.getTokens(user, manager);
            const googleToken = tokens.googleToken;
            const outlookToken = tokens.outlookToken;

            const eventUpdaters = [];

            if (googleToken) {
                const googleAccessToken = googleToken.accessToken;
                const googleCalendarClient = await this.getGoogleCredentials(
                    googleAccessToken,
                );
                const googleLocalPrimaryCalendar = await manager
                    .getRepository(Calendar)
                    .findOne({
                        owner: { id: user.id },
                        calendarType: CalendarTypeEnum.GoogleCalendar,
                        isPrimary: true,
                    });

                async function googleEventUpdater() {
                    await googleCalendarClient.events.update({
                        calendarId: googleLocalPrimaryCalendar.calendarId,
                        eventId: eventOld.googleId,
                        requestBody: {
                            summary: eventBody.title,
                            description: eventBody.description,
                            start: { dateTime: eventBody.start, timeZone: 'GMT' },
                            end: { dateTime: eventBody.end, timeZone: 'GMT' },
                        },
                    });
                }

                eventUpdaters.push(googleEventUpdater);
            }

            if (outlookToken) {
                const outlookAccessToken = outlookToken.accessToken;

                const outlookCalendarClient = await this.getOutlookCredentials(
                    outlookAccessToken,
                );

                const outlookLocalPrimaryCalendar = await manager
                    .getRepository(Calendar)
                    .findOne({
                        owner: { id: user.id },
                        calendarType: CalendarTypeEnum.Office365Calendar,
                        isPrimary: true,
                    });

                async function outlookEventUpdater() {
                    await outlookCalendarClient
                        .api(
                            `/me/calendars/${outlookLocalPrimaryCalendar.calendarId}/events/${eventOld.outlookId}`,
                        )
                        .update({
                            subject: eventBody.title,
                            bodyPreview: eventBody.description,
                            body: {
                                content: eventBody.description,
                            },
                            start: { dateTime: eventBody.start, timeZone: 'GMT' },
                            end: { dateTime: eventBody.end, timeZone: 'GMT' },
                        });
                }

                eventUpdaters.push(outlookEventUpdater);
            }

            await Promise.all(eventUpdaters.map((saver) => saver()));

            const eventToUpdate = new CalendarEvent();

            eventToUpdate.id = eventOld.id;
            eventToUpdate.googleId = eventOld.googleId || null;
            eventToUpdate.outlookId = eventOld.outlookId || null;
            eventToUpdate.eventType = EventTypeEnum.EntanglesCalendarEvent;
            eventToUpdate.owner = user;
            eventToUpdate.creator = user.email || null;
            eventToUpdate.start = eventBody.start
                ? new Date(eventBody.start)
                : eventOld.start;
            eventToUpdate.end = eventBody.end
                ? new Date(eventBody.end)
                : eventOld.end;
            eventToUpdate.title = eventBody.title || eventOld.title;
            eventToUpdate.meetLink = eventBody.meetLink || eventOld.meetLink;
            eventToUpdate.description = eventBody.description || eventOld.description;

            return await manager.getRepository(CalendarEvent).save(eventToUpdate);
        });
    }

    async stopGoogleWebhookChannel(
        user: User,
        token: string,
        calendarId: string,
        manager: EntityManager,
    ) {
        const calendarWebhookChannelRepo = manager.getRepository(
            CalendarWebhookChannel,
        );
        const googleCalendarClient = await this.getGoogleCredentials(token);
        const googleLocalPrimaryCalendar = await manager
            .getRepository(Calendar)
            .findOne({
                owner: { id: user.id },
                calendarType: CalendarTypeEnum.GoogleCalendar,
                calendarId: calendarId,
                isPrimary: true,
            });
        const existedGoogleWebhookChannel =
            await calendarWebhookChannelRepo.findOne({
                owner: { id: user.id },
                calendar: googleLocalPrimaryCalendar,
                calendarType: CalendarTypeEnum.GoogleCalendar,
            });
        if (existedGoogleWebhookChannel) {
            const stopChannelResponse = await googleCalendarClient.channels.stop({
                requestBody: {
                    id: googleLocalPrimaryCalendar.id,
                    token: token,
                    resourceId: existedGoogleWebhookChannel.channelId,
                },
            });

            if (stopChannelResponse.status === 204) {
                await calendarWebhookChannelRepo.delete({
                    owner: { id: user.id },
                    calendarType: CalendarTypeEnum.GoogleCalendar,
                });
            }
        }
    }

    async stopOutlookWebhookChannel(
        user: User,
        token: string,
        calendarId: string,
        manager: EntityManager,
    ) {
        const calendarWebhookChannelRepo = manager.getRepository(
            CalendarWebhookChannel,
        );
        const outlookCalendarClient = await this.getOutlookCredentials(token);
        const msLocalPrimaryCalendar = await manager
            .getRepository(Calendar)
            .findOne({
                owner: { id: user.id },
                calendarType: CalendarTypeEnum.Office365Calendar,
                calendarId: calendarId,
                isPrimary: true,
            });

        const existedOutlookWebhookChannel =
            await calendarWebhookChannelRepo.findOne({
                owner: { id: user.id },
                calendar: msLocalPrimaryCalendar,
                calendarType: CalendarTypeEnum.Office365Calendar,
            });

        if (existedOutlookWebhookChannel) {
            await outlookCalendarClient
                .api(`/subscriptions/${existedOutlookWebhookChannel.channelId}`)
                .delete();

            await calendarWebhookChannelRepo.delete({
                owner: { id: user.id },
                calendarType: CalendarTypeEnum.Office365Calendar,
            });
        }
    }

    async googleEventWatcher(
        user: User,
        calendar: Calendar,
        manager?: EntityManager,
    ) {
        return transactionManagerWrapper(
            manager,
            this.calendarWebhookChannelRepository,
            async (manager) => {
                const googleCalendarClient = await this.getGoogleCredentials(
                    calendar.calendarToken.accessToken,
                );

                const tunnel = await locaTunnel({
                    port: +this.configService.get<string>('PORT'),
                });

                const baseUrl =
                    this.configService.get<string>('NODE_ENVIRONMENT') === 'development'
                        ? tunnel.url
                        : this.configService.get<string>('WEB_PRODUCTION_HOST');

                const calendarWebhookChannelRepo = manager.getRepository(
                    CalendarWebhookChannel,
                );

                const watchResponse = await googleCalendarClient.events.watch({
                    requestBody: {
                        id: calendar.id,
                        type: 'web_hook',
                        address: `${baseUrl}/api/calendar/events/google-webhook`,
                        token: calendar.calendarToken.accessToken,
                        expiration: null,
                    },
                    calendarId: calendar.calendarId,
                });

                const webhookResourceId = watchResponse.data.resourceId;
                const webhookExpiration = +watchResponse.data.expiration;

                const webhookChannel = new CalendarWebhookChannel();
                webhookChannel.channelId = webhookResourceId;
                webhookChannel.expirationDate = new Date(webhookExpiration);
                webhookChannel.owner = user;
                webhookChannel.calendarType = CalendarTypeEnum.GoogleCalendar;
                webhookChannel.calendar = calendar;

                await calendarWebhookChannelRepo.save(webhookChannel);
            },
        );
    }

    async outlookEventWatcher(
        user: User,
        calendar: Calendar,
        manager?: EntityManager,
    ) {
        const outlookCalendarClient = await this.getOutlookCredentials(
            calendar.calendarToken.accessToken,
        );

        const tunnel = await locaTunnel({
            port: +this.configService.get<string>('PORT'),
        });

        const baseUrl =
            this.configService.get<string>('NODE_ENVIRONMENT') === 'development'
                ? tunnel.url
                : this.configService.get<string>('WEB_PRODUCTION_HOST');

        const calendarWebhookChannelRepo = manager.getRepository(
            CalendarWebhookChannel,
        );

        const watchResponse = await outlookCalendarClient
            .api('/subscriptions')
            .post({
                changeType: 'deleted,updated,created',
                notificationUrl: `${baseUrl}/api/calendar/events/outlook-webhook`,
                resource: 'me/events',
                token: calendar.calendarToken.accessToken,
                expirationDateTime: new Date(Date.now() + 250560000).toISOString(),
            });


        const webhookChannel = new CalendarWebhookChannel();
        webhookChannel.channelId = watchResponse.id;
        webhookChannel.expirationDate = new Date(watchResponse.expirationDateTime);
        webhookChannel.owner = user;
        webhookChannel.calendarType = CalendarTypeEnum.Office365Calendar;
        webhookChannel.calendar = calendar;

        await calendarWebhookChannelRepo.save(webhookChannel);
    }

<<<<<<< HEAD
    async getWebhookByChannelId(channel: string | string[]) {
        return this.calendarWebhookChannelRepository.findOne({
            where: { channelId: channel },
            relations: ['owner', 'calendar'],
=======
    const eventManager = await this.calendarService.initManager(
      calendar.calendarToken.accessToken,
      CalendarTypeEnum.Office365Calendar,
    );
    const watchResponse = await eventManager.createWebhook(
      calendar.id,
      calendar.calendarId,
    );

    const webhookChannel = new CalendarWebhookChannel();
    webhookChannel.channelId = watchResponse.id;
    webhookChannel.expirationDate = new Date(watchResponse.expirationDateTime);
    webhookChannel.owner = user;
    webhookChannel.calendarType = CalendarTypeEnum.Office365Calendar;
    webhookChannel.calendar = calendar;

    await calendarWebhookChannelRepo.save(webhookChannel);
  }

  async getWebhookByChannelId(channel: string | string[]) {
    return this.calendarWebhookChannelRepository.findOne({
      where: { channelId: channel },
      relations: ['owner', 'calendar'],
    });
  }

  async getTokens(
    user: User,
    manager: EntityManager,
  ): Promise<{ googleToken: CalendarToken; outlookToken: CalendarToken }> {
    const googleToken = await manager.getRepository(CalendarToken).findOne({
      owner: { id: user.id },
      calendarType: CalendarTypeEnum.GoogleCalendar,
    });

    const outlookToken = await manager.getRepository(CalendarToken).findOne({
      owner: { id: user.id },
      calendarType: CalendarTypeEnum.Office365Calendar,
    });
    return { googleToken, outlookToken };
  }

  async getEventsByUserIds(
    userIds: string[],
    query: TimeIntervalDto,
  ): Promise<CalendarEvent[]> {
    const commonEvents = await this.calendarEventRepository
      .createQueryBuilder()
      .where({ owner: In(userIds.map((id) => id)) })
      .andWhere('"start" > :start', { start: query.startDate })
      .andWhere('"end" < :end', { end: query.dateEnd })
      .andWhere('"recurrenceType" is null')
      .orderBy('start')
      .getMany();

    const recurringEventsFromDb = await this.calendarEventRepository
      .createQueryBuilder()
      .where({ owner: In(userIds.map((id) => id)) })
      .andWhere('"recurrenceType" IS NOT NULL')
      .orderBy('start')
      .getMany();

    return this.joinCommonAndRecurrenceEvents(
      commonEvents,
      recurringEventsFromDb,
      query,
    );
  }

  private compareEvents(eventsFromDb, remoteEvents, eventIdProperty) {
    function mapFromArray(
      array: Array<any>,
      prop: string,
    ): { [index: number]: any } {
      const map = {};
      for (let i = 0; i < array.length; i++) {
        map[array[i][prop]] = array[i];
      }
      return map;
    }

    function isEqualAttendee(a, b): boolean {
      return (
        a.email === b.email &&
        a.optional == b.optional &&
        a.responseStatus === b.responseStatus
      );
    }

    function isEqualEvent(a, b): boolean {
      const basicDataMatch =
        a.start &&
        a.start.getTime() === b.start.getTime() &&
        a.end.getTime() === b.end.getTime() &&
        a.title === b.title &&
        a.description === b.description;

      if (basicDataMatch) {
        let attendeeDataMatch = a.attendees?.length == b.attendees?.length;
        if (attendeeDataMatch) {
          const arrMapA = mapFromArray(a.attendees, 'email');
          const arrMapB = mapFromArray(b.attendees, 'email');

          for (const email in arrMapA) {
            if (!arrMapB.hasOwnProperty(email)) {
              attendeeDataMatch = false;
              break;
            } else {
              attendeeDataMatch = isEqualAttendee(
                arrMapA[email],
                arrMapB[email],
              );
              if (!attendeeDataMatch) break;
            }
          }

          if (attendeeDataMatch) {
            const recurrenceDataMatch =
              a.recurrenceType == b.recurrenceType &&
              a.recurrenceInterval == b.recurrenceInterval &&
              a.recurrenceDaysOfWeek == b.recurrenceDaysOfWeek &&
              a.recurrenceIndexOfWeek == b.recurrenceIndexOfWeek &&
              a.recurrenceDayOfMonth == b.recurrenceDayOfMonth &&
              a.recurrenceMonth == b.recurrenceMonth &&
              a.recurrenceFirstDayOfWeek == b.recurrenceFirstDayOfWeek &&
              a.recurrenceStartDate?.getTime() ==
                b.recurrenceStartDate?.getTime() &&
              a.recurrenceEndDate?.getTime() ==
                b.recurrenceEndDate?.getTime() &&
              a.recurrenceNumberOfOccurrences ==
                b.recurrenceNumberOfOccurrences;

            return recurrenceDataMatch;
          }
        }
      }
      return false;
    }

    function getDelta(
      o: Array<any>,
      n: Array<any>,
      comparator: (a, b) => boolean,
      eventIdProperty: string,
    ): { added: Array<any>; deleted: Array<any>; changed: Array<any> } {
      const delta = {
        added: <Array<any>>[],
        deleted: <Array<any>>[],
        changed: <Array<any>>[],
      };
      const mapO = mapFromArray(o, eventIdProperty);
      const mapN = mapFromArray(n, eventIdProperty);
      for (const id in mapO) {
        if (!mapN.hasOwnProperty(id)) {
          delta.deleted.push(mapO[id]);
        } else if (!comparator(mapN[id], mapO[id])) {
          delta.changed.push(mapN[id]);
        }
      }

      for (const id in mapN) {
        if (!mapO.hasOwnProperty(id)) {
          delta.added.push(mapN[id]);
        }
      }
      return delta;
    }

    return getDelta(eventsFromDb, remoteEvents, isEqualEvent, eventIdProperty);
  }

  private convertDateToNegativeLocalTimeZone(inputDate: string) {
    const date = new Date(inputDate);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset);
  }

  private serializedOutlookEventRecurrence(event: CalendarEvent, item) {
    const recurrenceType = item.recurrence?.pattern.type;
    const firstDayOfWeek = item.recurrence?.pattern.firstDayOfWeek;
    if (
      recurrenceType === 'absoluteMonthly' ||
      recurrenceType === 'relativeMonthly'
    ) {
      event.recurrenceType = EventRecurrenceTypeEnum.MONTHLY || null;
    } else if (
      recurrenceType === 'absoluteYearly' ||
      recurrenceType === 'relativeYearly'
    ) {
      event.recurrenceType = EventRecurrenceTypeEnum.YEARLY || null;
    } else {
      event.recurrenceType = recurrenceType || null;
    }
    event.recurrenceInterval = item.recurrence?.pattern.interval || null;
    event.recurrenceDaysOfWeek = item.recurrence?.pattern.daysOfWeek
      ? item.recurrence?.pattern.daysOfWeek.map((weekDay) => {
          const capitalizedWeekDay =
            weekDay.charAt(0).toUpperCase() + weekDay.slice(1);
          return WeekDaysEnum[capitalizedWeekDay];
        })
      : null;
    event.recurrenceIndexOfWeek = item.recurrence?.pattern.index || null;
    event.recurrenceDayOfMonth = item.recurrence?.pattern.dayOfMonth || null;
    event.recurrenceMonth = item.recurrence?.pattern.month || null;
    event.recurrenceFirstDayOfWeek = firstDayOfWeek
      ? FirstWeekDaysOutlookAbbreviateEnum[firstDayOfWeek]
      : null;
    event.recurrenceStartDate = item.recurrence?.range.startDate
      ? this.convertDateToNegativeLocalTimeZone(
          item.recurrence?.range.startDate,
        )
      : null;
    event.recurrenceEndDate = item.recurrence?.range.endDate
      ? this.convertDateToNegativeLocalTimeZone(item.recurrence?.range.endDate)
      : null;
    event.recurrenceNumberOfOccurrences =
      item.recurrence?.range.numberOfOccurrences || null;
  }

  private serializedGoogleEventRecurrence(
    event: CalendarEvent,
    eventFromGoogle,
  ) {
    const recurrence = eventFromGoogle.recurrence[0].split(';');

    function serializer(event, recurrenceElementArr, eventFromGoogle) {
      event.recurrenceStartDate = eventFromGoogle.created
        ? new Date(eventFromGoogle.created)
        : null;
      switch (recurrenceElementArr[0]) {
        case 'RRULE:FREQ':
          if (recurrenceElementArr[1] === 'YEARLY') {
            event.recurrenceDayOfMonth =
              new Date(eventFromGoogle.start?.dateTime).getDate() || null;
            event.recurrenceMonth =
              new Date(eventFromGoogle.start?.dateTime).getMonth() + 1 || null;
          }
          if (recurrenceElementArr[1] === 'MONTHLY') {
            event.recurrenceDayOfMonth =
              new Date(eventFromGoogle.start?.dateTime).getDate() || null;
          }

          event.recurrenceType = recurrenceElementArr[1].toLowerCase();
          break;
        case 'WKST':
          event.recurrenceFirstDayOfWeek =
            FirstWeekDaysAbbreviateEnum[recurrenceElementArr[1]];
          break;

        case 'COUNT':
          event.recurrenceNumberOfOccurrences = recurrenceElementArr[1]
            ? Number(recurrenceElementArr[1])
            : null;
          break;

        case 'BYDAY':
          const byDay = recurrenceElementArr[1];

          if (/\d/.test(byDay)) {
            const index = Math.floor(byDay.length / 2);
            const byDayArr = [byDay.slice(0, index), byDay.slice(index)];
            const byDayIndex = Number(byDayArr[0]);
            const byDayWeekDay = byDayArr[1];

            event.recurrenceDaysOfWeek = [GoogleWeekDaysEnum[byDayWeekDay]];
            event.recurrenceIndexOfWeek = GoogleIndexOfWeekEnum[byDayIndex];
            break;
          }
          const weekDays = recurrenceElementArr[1].split(',');
          event.recurrenceDaysOfWeek = weekDays.map((item) => {
            return GoogleWeekDaysEnum[item];
          });
          break;
        case 'UNTIL':
          event.recurrenceEndDate = new Date(
            +moment(recurrenceElementArr[1]).format('X'),
          );
          break;
        case 'INTERVAL':
          event.recurrenceInterval = recurrenceElementArr[1]
            ? Number(recurrenceElementArr[1])
            : null;
          break;
      }
    }

    for (const recurrenceElement of recurrence) {
      const recurrenceElementArr = recurrenceElement.split('=');
      serializer(event, recurrenceElementArr, eventFromGoogle);
    }
  }

  private joinCommonAndRecurrenceEvents(
    commonEvents,
    recurringEventsFromDb,
    query,
  ): CalendarEvent[] {
    const recurringEvents = [];

    recurringEventsFromDb.map((event) => {
      const recurrenceType = getEnumKeyByEnumValue(
        EventRecurrenceTypeEnum,
        event.recurrenceType,
      );

      const firstDayOfWeek = getEnumKeyByEnumValue(
        FirstWeekDaysAbbreviateEnum,
        event.recurrenceFirstDayOfWeek,
      );

      const recurrenceDaysOfWeek = event.recurrenceDaysOfWeek
        ? event.recurrenceDaysOfWeek.map((day) => {
            return RRule[getEnumKeyByEnumValue(WeekDaysAbbreviateEnum, day)];
          })
        : null;

      const generatedRecurringEvents = new RRule({
        freq: RRule[recurrenceType],
        dtstart: new Date(event.recurrenceStartDate),
        interval: event.recurrenceInterval ? event.recurrenceInterval : 1,
        wkst: RRule[firstDayOfWeek],
        count: event.recurrenceNumberOfOccurrences,
        until: event.recurrenceEndDate
          ? new Date(event.recurrenceEndDate)
          : null,
        bysetpos:
          Number(IndexOfWeekToNumberEnum[event.recurrenceIndexOfWeek]) || null,
        byweekday: recurrenceDaysOfWeek,
        bymonth: event.recurrenceMonth,
        bymonthday: event.recurrenceDayOfMonth,
      }).between(new Date(query.startDate), new Date(query.dateEnd));

      for (const generatedRecurringEvent of generatedRecurringEvents) {
        let start = null;
        let end = null;

        if (event.allDay) {
          const startIso = event.recurrenceStartDate.toISOString();
          const startDay = moment(generatedRecurringEvent).format('YYYY-MM-DD');
          start = startDay + startIso.slice(startIso.indexOf('T'));
          start = new Date(start);
        } else {
          const startIso = event.start.toISOString();
          const endIso = event.end.toISOString();
          const startDay = moment(generatedRecurringEvent).format('YYYY-MM-DD');
          const endDay = moment(generatedRecurringEvent).format('YYYY-MM-DD');

          start = startDay + startIso.slice(startIso.indexOf('T'));
          start = new Date(start);

          end = endDay + endIso.slice(endIso.indexOf('T'));
          end = new Date(end);
        }

        commonEvents.push({
          ...event,
          start: start,
          end: end,
          allDay: event.allDay,
>>>>>>> f8a7810 (fix: refactor event comparison to check also for attendees)
        });
    }

    async getTokens(
        user: User,
        manager: EntityManager,
    ): Promise<{ googleToken: CalendarToken; outlookToken: CalendarToken }> {
        const googleToken = await manager.getRepository(CalendarToken).findOne({
            owner: { id: user.id },
            calendarType: CalendarTypeEnum.GoogleCalendar,
        });
        const outlookToken = await manager.getRepository(CalendarToken).findOne({
            owner: { id: user.id },
            calendarType: CalendarTypeEnum.Office365Calendar,
        });
        return { googleToken, outlookToken };
    }

    private compareEvents(eventsFromDb, remoteEvents, eventIdProperty) {
        function mapFromArray(
            array: Array<any>,
            prop: string,
        ): { [index: number]: any } {
            const map = {};
            for (let i = 0; i < array.length; i++) {
                map[array[i][prop]] = array[i];
            }
            return map;
        }

        function isEqualEvent(a, b): boolean {
            return (
                a.start.getTime() === b.start.getTime() &&
                a.end.getTime() === b.end.getTime() &&
                a.title === b.title &&
                a.description === b.description
                // a.recurrenceType === b.recurrenceType &&
                // a.recurrenceInterval === b.recurrenceInterval &&
                // a.recurrenceDaysOfWeek === b.recurrenceDaysOfWeek &&
                // a.recurrenceIndexOfWeek === b.recurrenceIndexOfWeek &&
                // a.recurrenceDayOfMonth === b.recurrenceDayOfMonth &&
                // a.recurrenceMonth === b.recurrenceMonth &&
                // a.recurrenceFirstDayOfWeek === b.recurrenceFirstDayOfWeek &&
                // a.recurrenceStartDate.getTime() === b.recurrenceStartDate.getTime() &&
                // a.recurrenceEndDate.getTime() === b.recurrenceEndDate.getTime() &&
                // a.recurrenceNumberOfOccurrences === b.recurrenceNumberOfOccurrences
            );
        }

        function getDelta(
            o: Array<any>,
            n: Array<any>,
            comparator: (a, b) => boolean,
            eventIdProperty: string,
        ): { added: Array<any>; deleted: Array<any>; changed: Array<any> } {
            const delta = {
                added: <Array<any>>[],
                deleted: <Array<any>>[],
                changed: <Array<any>>[],
            };
            const mapO = mapFromArray(o, eventIdProperty);
            const mapN = mapFromArray(n, eventIdProperty);
            for (const id in mapO) {
                if (!mapN.hasOwnProperty(id)) {
                    delta.deleted.push(mapO[id]);
                } else if (!comparator(mapN[id], mapO[id])) {
                    delta.changed.push(mapN[id]);
                }
            }

            for (const id in mapN) {
                if (!mapO.hasOwnProperty(id)) {
                    delta.added.push(mapN[id]);
                }
            }
            return delta;
        }

        return getDelta(eventsFromDb, remoteEvents, isEqualEvent, eventIdProperty);
    }

    private async getGoogleCredentials(accessToken: string) {
        await this.clientsCredentials.googleOAuth2Client.setCredentials({
            access_token: accessToken,
        });

        return google.calendar({
            version: 'v3',
            auth: this.clientsCredentials.googleOAuth2Client,
        });
    }

    private async getOutlookCredentials(accessToken: string) {
        return graph.Client.init({
            authProvider: (done) => {
                done(null, accessToken);
            },
        });
    }

    private convertDateToNegativeLocalTimeZone(inputDate: string) {
        const date = new Date(inputDate);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() + userTimezoneOffset);
    }

    private serializedOutlookEventRecurrence(event: CalendarEvent, item) {
        const recurrenceType = item.recurrence?.pattern.type;
        if (
            recurrenceType === 'absoluteMonthly' ||
            recurrenceType === 'relativeMonthly'
        ) {
            event.recurrenceType = EventRecurrenceTypeEnum.Monthly || null;
        } else if (
            recurrenceType === 'absoluteYearly' ||
            recurrenceType === 'relativeYearly'
        ) {
            event.recurrenceType = EventRecurrenceTypeEnum.Yearly || null;
        } else {
            event.recurrenceType = recurrenceType || null;
        }
        event.recurrenceInterval = item.recurrence?.pattern.interval || null;
        event.recurrenceDaysOfWeek = item.recurrence?.pattern.daysOfWeek
            ? item.recurrence?.pattern.daysOfWeek.map((weekDay) => {
                const capitalizedWeekDay =
                    weekDay.charAt(0).toUpperCase() + weekDay.slice(1);
                return WeekDaysEnum[capitalizedWeekDay];
            })
            : null;
        event.recurrenceIndexOfWeek = item.recurrence?.pattern.index || null;
        event.recurrenceDayOfMonth = item.recurrence?.pattern.dayOfMonth || null;
        event.recurrenceMonth = item.recurrence?.pattern.month || null;
        event.recurrenceFirstDayOfWeek =
            item.recurrence?.pattern.firstDayOfWeek || null;
        event.recurrenceStartDate = item.recurrence?.range.startDate
            ? this.convertDateToNegativeLocalTimeZone(
                item.recurrence?.range.startDate,
            )
            : null;
        event.recurrenceEndDate = item.recurrence?.range.endDate
            ? this.convertDateToNegativeLocalTimeZone(item.recurrence?.range.endDate)
            : null;
        event.recurrenceNumberOfOccurrences =
            item.recurrence?.range.numberOfOccurrences || null;
    }

    private serializedGoogleEventRecurrence(
        event: CalendarEvent,
        eventFromGoogle,
    ) {
        const recurrence = eventFromGoogle.recurrence[0].split(';');

        function serializer(event, recurrenceElementArr, eventFromGoogle) {
            event.recurrenceStartDate = eventFromGoogle.created
                ? new Date(eventFromGoogle.created)
                : null;
            switch (recurrenceElementArr[0]) {
                case 'RRULE:FREQ':
                    if (recurrenceElementArr[1] === 'YEARLY') {
                        event.recurrenceDayOfMonth =
                            new Date(eventFromGoogle.start?.dateTime).getDate() || null;
                        event.recurrenceMonth =
                            new Date(eventFromGoogle.start?.dateTime).getMonth() + 1 || null;
                    }
                    event.recurrenceType = recurrenceElementArr[1].toLowerCase();
                    break;
                case 'WKST':
                    event.recurrenceFirstDayOfWeek =
                        recurrenceElementArr[1] === 'SU' ? 'sunday' : 'monday';
                    break;

                case 'COUNT':
                    event.recurrenceNumberOfOccurrences = recurrenceElementArr[1]
                        ? Number(recurrenceElementArr[1])
                        : null;
                    break;

                case 'BYDAY':
                    const byDay = recurrenceElementArr[1];

                    if (/\d/.test(byDay)) {
                        const index = Math.floor(byDay.length / 2);
                        const byDayArr = [byDay.slice(0, index), byDay.slice(index)];
                        const byDayIndex = Number(byDayArr[0]);
                        const byDayWeekDay = byDayArr[1];
                        const daysOfWeekArr = [GoogleWeekDaysEnum[byDayWeekDay]];

                        event.recurrenceDaysOfWeek = daysOfWeekArr;
                        event.recurrenceIndexOfWeek = GoogleIndexOfWeekEnum[byDayIndex];
                        break;
                    }
                    const weekDays = recurrenceElementArr[1].split(',');
                    event.recurrenceDaysOfWeek = weekDays.map((item) => {
                        return GoogleWeekDaysEnum[item];
                    });
                    break;
                case 'UNTIL':
                    event.recurrenceEndDate = new Date(
                        +moment(recurrenceElementArr[1]).format('X'),
                    );
                    break;
                case 'INTERVAL':
                    event.recurrenceInterval = recurrenceElementArr[1]
                        ? Number(recurrenceElementArr[1])
                        : null;
                    break;
            }
        }

        for (const recurrenceElement of recurrence) {
            const recurrenceElementArr = recurrenceElement.split('=');
            serializer(event, recurrenceElementArr, eventFromGoogle);
        }
    }
}
