import {
    BadRequestException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CalendarToken } from '../calendar-permissions/entity/calendarToken.entity';
import {
    Connection,
    EntityManager,
    In,
    IsNull,
    Not,
    Repository,
} from 'typeorm';
import { CalendarTypeEnum } from '../calendar-permissions/enums/calendarType.enum';
import 'isomorphic-fetch';
import { Calendar } from './entities/calendar.entity';
import { User } from '@user/entity/user.entity';
import { CalendarEvent } from './entities/calendarEvent.entity';
import TimeIntervalDto from './dto/timeInterval.dto';
import { EventTypeEnum } from './enums/eventType.enum';
import CreateEventDto from './dto/createEvent.dto';
import { transactionManagerWrapper } from '../../components/helpers/dbTransactionManager';
import UpdateEventDto from './dto/updateEvent.dto';
import { CalendarWebhookChannel } from './entities/calendarWebhookChannel.entity';
import { ErrorMessages } from 'src/components/constants/error.messages';
import { randomUUID } from 'crypto';
import {
    FirstWeekDaysAbbreviateEnum,
    WeekDaysAbbreviateEnum,
} from './enums/weekDays.enum';
import { IndexOfWeekToNumberEnum } from './enums/indexOfWeek.enum';
import { EventRecurrenceTypeEnum } from './enums/eventRecurrenceType.enum';
import { RRule } from 'rrule';
import { getEnumKeyByEnumValue } from '../../components/helpers/getEnumKeyByEnumValue';
import moment = require('moment-timezone');
import GoogleMeetLinkDto from './dto/GoogleMeetLink.dto';
import { IResponseMessage } from 'src/components/interfaces/response.interface';
import { MeetViaEnum } from 'src/sharable-links/enums/sharable-links.enum';
import { CalendarService, EventManager } from '../calendar.service';
import { ZoomService } from 'src/integrations/zoom/zoom.service';
import { IZoomMeetingResponse } from 'src/integrations/zoom/interfaces/zoom.interface';

@Injectable()
export class CalendarEventService {
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
        private readonly zoomService: ZoomService,
        private readonly connection: Connection,
    ) {}

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

                const eventManager = await this.calendarService.initManager(
                    accessToken,
                );

                const calendarList = await eventManager.getAllCalendars();

                const calendarSerializedList = calendarList
                    .filter((item) => {
                        return item.primary;
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
                        calendar.summary = item.summary;
                        calendar.isPrimary = item.primary ? item.primary : false;
                        calendar.calendarType = CalendarTypeEnum.GoogleCalendar;
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
                const eventsFromCal = eventManager.serializeEvents(
                    await eventManager.getAllEvents(
                        calendar.calendarId,
                        moment().subtract(3, 'months').format('YYYY-MM-DDTHH:mm:ss.sssZ'),
                        'GMT',
                    ),
                    calendar,
                    user,
                );

                const delta = this.compareEvents(
                    eventsFromDb,
                    eventsFromCal,
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
                const eventsFromCal = eventManager.serializeEvents(
                    await eventManager.getAllEvents(calendar.calendarId, '', 'GMT'),
                    calendar,
                    user,
                );

                const delta = this.compareEvents(
                    eventsFromDb,
                    eventsFromCal,
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
            const event = await this.createorUpdateThirdPartyEvent(
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
                        },
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

            if (event.entanglesLocation == MeetViaEnum.Zoom) {
                await this.zoomService.deleteMeeting(user, event.zoom.id);
            }

            if (event.calendar.calendarType == CalendarTypeEnum.GoogleCalendar) {
                const eventManager = await this.calendarService.initManager(
                    googleToken.accessToken,
                );

                const gEvent = await eventManager.getEvent(
                    event.calendar.calendarId,
                    event.externalId,
                );

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

            if (event.calendar.calendarType == CalendarTypeEnum.Office365Calendar) {
                const eventManager = await this.calendarService.initManager(
                    outlookToken.accessToken,
                    CalendarTypeEnum.Office365Calendar,
                );

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

            await Promise.all(eventDeleters.map((saver) => saver()));
            const x = await manager
                .getRepository(CalendarEvent)
                .delete({ id: event.id });
            return x;
        });
    }

    async updateUserCalendarEvent(
        user: User,
        eventDto: UpdateEventDto,
        eventId: string,
    ) {
        return this.calendarTokenRepository.manager.transaction(async (manager) => {
            const eventOld = await manager.getRepository(CalendarEvent).findOne({
                where: { id: eventId },
            });
            if (!eventOld) {
                throw new NotFoundException('Event not found');
            }
            const event = await this.createorUpdateThirdPartyEvent(
                manager,
                user,
                eventDto,
                eventOld,
            );
            event.id = eventId;
            return await manager.getRepository(CalendarEvent).save(event);
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
        const eventManager = await this.calendarService.initManager(token);
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
            const stopChannelResponse = await eventManager.removeWebhook(
                googleLocalPrimaryCalendar.id,
                existedGoogleWebhookChannel.channelId,
            );

            if (stopChannelResponse) {
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
            const eventManager = await this.calendarService.initManager(
                token,
                CalendarTypeEnum.Office365Calendar,
            );
            await eventManager.removeWebhook(
                calendarId,
                existedOutlookWebhookChannel.channelId,
            );
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
                const calendarWebhookChannelRepo = manager.getRepository(
                    CalendarWebhookChannel,
                );

                const existedCalendarWebhookChannel =
                    await calendarWebhookChannelRepo.findOne({
                        where: { calendar: { id: calendar.id } },
                    });

                if (existedCalendarWebhookChannel) {
                    return;
                }

                const eventManager = await this.calendarService.initManager(
                    calendar.calendarToken.accessToken,
                );
                const watchResponse = await eventManager.createWebhook(
                    calendar.id,
                    calendar.calendarId,
                );

                const webhookResourceId = watchResponse.resourceId;
                const webhookExpiration = +watchResponse.expiration;

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
        const calendarWebhookChannelRepo = manager.getRepository(
            CalendarWebhookChannel,
        );

        const existedCalendarWebhookChannel =
            await calendarWebhookChannelRepo.findOne({
                where: { calendar: { id: calendar.id } },
            });

        if (existedCalendarWebhookChannel) {
            return;
        }

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
                });
            }
        });

        return [...commonEvents, ...recurringEvents]
            .sort((a, b) => {
                return a.start.getTime() - b.start.getTime();
            })
            .map((event) => {
                return { ...event, additionalId: randomUUID() };
            });
    }

    private getEventDescription(eventDto: CreateEventDto): string {
        const additional_description = (): string => {
            switch (eventDto.entanglesLocation) {
                case MeetViaEnum.Zoom:
                    return 'Zoom meeting information:';
                case MeetViaEnum.InboundCall:
                    return `Please give me a call at: ${eventDto.phoneNumber ?? ''}`;
                case MeetViaEnum.OutboundCall:
                    return 'You will receive a call from me.';
                case MeetViaEnum.PhysicalAddress:
                    return `Lets meet at ${eventDto.address ?? ''}`;
                default:
                    return '';
            }
        };

        return `
      <p>${eventDto.description}</p>
      <p>${additional_description()}</p>
    `;
    }

    private async createorUpdateThirdPartyEvent(
        manager: EntityManager,
        user: User,
        eventDto: CreateEventDto,
        oldEvent: CalendarEvent | null = null,
    ) {
        const tokens = await this.getTokens(user, manager);
        const googleToken = tokens.googleToken;
        const outlookToken = tokens.outlookToken;
        const eventSavers = [];

        const calendar = await manager.getRepository(Calendar).findOne({
            owner: { id: user.id },
            id: eventDto.calendarId,
        });

        if (!calendar) {
            throw new BadRequestException({
                message: ErrorMessages.calendarNotFound,
            });
        }

        // start: manage zoom meeting loation
        let zoomData: IZoomMeetingResponse | null = null;
        try {
            if (
                oldEvent?.entanglesLocation === MeetViaEnum.Zoom &&
                eventDto.entanglesLocation !== MeetViaEnum.Zoom
            ) {
                await this.zoomService.deleteMeeting(user, oldEvent?.zoom.id);
            }

            if (
                oldEvent?.entanglesLocation != MeetViaEnum.Zoom &&
                eventDto.entanglesLocation == MeetViaEnum.Zoom
            ) {
                zoomData = await this.zoomService.createMeeting(user, {
                    topic: eventDto.title,
                    start_time: eventDto.start,
                    meeting_invitees: eventDto.attendees?.map((email) => {
                        return { email: email };
                    }),
                });
            }
        } catch (e) {
            throw new BadRequestException(e);
        }
        // end: manage zoom meeting loation

        // start: serialize attendee data
        let attendeeData = [];
        if (calendar.calendarType === CalendarTypeEnum.GoogleCalendar) {
            attendeeData = attendeeData.concat(
                this.mapGoogleAttendees(eventDto.attendees ?? []),
            );
            attendeeData = attendeeData.concat(
                this.mapGoogleAttendees(eventDto.optionalAttendees ?? []),
            );
        } else if (calendar.calendarType === CalendarTypeEnum.Office365Calendar) {
            attendeeData = attendeeData.concat(
                this.mapOutlookAttendees(eventDto.attendees ?? []),
            );
            attendeeData = attendeeData.concat(
                this.mapOutlookAttendees(eventDto.optionalAttendees ?? []),
            );
        }
        // end: serialize attendee data

        let eventManager: EventManager;
        if (calendar.calendarType === CalendarTypeEnum.GoogleCalendar) {
            eventManager = await this.calendarService.initManager(
                googleToken.accessToken,
            );

            const saveEventGoogle = async (isUpdate = false) => {
                const eventData = {
                    conferenceDataVersion: 1,
                    sendNotifications: true,
                    calendarId: calendar.calendarId,
                    requestBody: {
                        summary: eventDto.title,
                        location: zoomData?.join_url ?? '',
                        start: { dateTime: eventDto.start, timeZone: 'GMT' },
                        end: { dateTime: eventDto.end, timeZone: 'GMT' },
                        attendees: attendeeData,
                        description: this.getEventDescription(eventDto),
                    },
                };
                if (isUpdate) {
                    eventData['eventId'] = oldEvent?.externalId;
                }
                if (eventDto.entanglesLocation == MeetViaEnum.GMeet) {
                    Object.assign(eventData.requestBody, {
                        conferenceData: {
                            createRequest: {
                                conferenceSolutionKey: {
                                    type: 'hangoutsMeet',
                                },
                                requestId: randomUUID(),
                            },
                        },
                    });
                }
                return await eventManager.saveEvent(eventData, isUpdate, null);
            };
            eventSavers.push(saveEventGoogle);
        } else if (calendar.calendarType === CalendarTypeEnum.Office365Calendar) {
            eventManager = await this.calendarService.initManager(
                outlookToken.accessToken,
                CalendarTypeEnum.Office365Calendar,
            );

            const saveEventOutlook = async (isUpdate = false) => {
                const eventData = {
                    subject: eventDto.title,
                    bodyPreview: eventDto.description,
                    location: {
                        displayName: zoomData?.join_url ?? '',
                    },
                    body: {
                        contentType: 'HTML',
                        content: this.getEventDescription(eventDto),
                    },
                    attendees: attendeeData,
                    start: { dateTime: eventDto.start, timeZone: 'GMT' },
                    end: { dateTime: eventDto.end, timeZone: 'GMT' },
                };

                return await eventManager.saveEvent(eventData, isUpdate, {
                    eventId: oldEvent?.externalId,
                    calendarId: calendar.calendarId,
                });
            };
            eventSavers.push(saveEventOutlook);
        }

        const eventResponse = await Promise.all(
            eventSavers.map((saver) => saver(oldEvent?.externalId != null)),
        );
        const event = eventManager.serializeEvent(eventResponse[0], calendar, user);
        event.entanglesLocation = eventDto.entanglesLocation;
        event.address = eventDto.address;
        event.phoneNumber = eventDto.phoneNumber;
        event.zoom = zoomData;
        return event;
    }

    private mapGoogleAttendees(attendees: string[], isOptional = false) {
        return attendees.map((attendee) => {
            return {
                email: attendee,
                optional: isOptional,
            };
        });
    }

    private mapOutlookAttendees(attendees: string[], isOptional = false) {
        return attendees.map((attendee) => {
            return {
                emailAddress: {
                    address: attendee,
                    name: attendee,
                },
                type: isOptional ? 'optional' : 'required',
            };
        });
    }
}
