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
import { google } from 'googleapis';
import * as graph from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import { Calendar } from './entities/calendar.entity';
import { User } from '@user/entity/user.entity';
import { CalendarEvent } from './entities/calendarEvent.entity';
import { EventTypeEnum } from './enums/eventType.enum';
import CreateEventDto from './dto/createEvent.dto';
import { transactionManagerWrapper } from '../../components/helpers/dbTransactionManager';
import UpdateEventDto from './dto/updateEvent.dto';
import * as locaTunnel from 'localtunnel';
import { CalendarWebhookChannel } from './entities/calendarWebhookChannel.entity';
import { ConfigService } from '@nestjs/config';
import { ErrorMessages } from 'src/components/constants/error.messages';
import { randomUUID } from 'crypto';
import { WeekDaysEnum } from './enums/weekDays.enum';
import { GoogleWeekDaysEnum } from './enums/googleWeekDays.enum';
import { GoogleIndexOfWeekEnum } from './enums/indexOfWeek.enum';
import { EventRecurrenceTypeEnum } from './enums/eventRecurrenceType.enum';
import moment = require('moment');

@Injectable()
export class CalendarEventService {
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

                return await manager
                    .getRepository(Calendar)
                    .save(calendarSerializedList[0]);
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

                return await manager.getRepository(CalendarEvent).save(delta.added);
            });

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

        console.log('event ', event.value[0]);
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
