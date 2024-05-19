import { Injectable, NotFoundException } from '@nestjs/common';
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

  async getCalendarsFromGoogle(user: User, manager?: EntityManager) {
    return transactionManagerWrapper(
      manager,
      this.calendarTokenRepository,
      async (manager) => {
        const token = await manager.getRepository(CalendarToken).findOne({
          owner: { id: user.id },
          calendarType: CalendarTypeEnum.GoogleCalendar,
        });

        if (!token) {
          throw new NotFoundException(
            'You have not calendar-event access token',
          );
        }

        const { accessToken } = token;

        const calendar = await this.getGoogleCredentials(accessToken);

        const calendarList = await calendar.calendarList.list();

        await manager.getRepository(Calendar).delete({
          owner: { id: user.id },
          calendarType: CalendarTypeEnum.GoogleCalendar,
        });

        const calendarSerializedList = calendarList.data.items.map((item) => {
          const calendar = new Calendar();
          calendar.calendarId = item.id;
          calendar.summary = item.summary;
          calendar.isPrimary = item.primary ? item.primary : false;
          calendar.calendarType = CalendarTypeEnum.GoogleCalendar;
          calendar.owner = user;
          return calendar;
        });

        return await manager
          .getRepository(Calendar)
          .save(calendarSerializedList);
      },
    );
  }

  async getCalendarsFromOutlook(user: User, manager?: EntityManager) {
    return transactionManagerWrapper(
      manager,
      this.calendarTokenRepository,
      async (manager) => {
        const token = await manager.getRepository(CalendarToken).findOne({
          owner: { id: user.id },
          calendarType: CalendarTypeEnum.Office365Calendar,
        });
        if (!token) {
          throw new NotFoundException(
            'You have not calendar-event access token',
          );
        }

        const { accessToken } = token;

        const client = await this.getOutlookCredentials(accessToken);

        const calendarList = await client
          .api('https://graph.microsoft.com/v1.0/me/calendars/')
          .get();

        await manager.getRepository(Calendar).delete({
          owner: { id: user.id },
          calendarType: CalendarTypeEnum.Office365Calendar,
        });

        const calendarSerializedList = calendarList.value.map((item) => {
          const calendar = new Calendar();
          calendar.calendarId = item.id;
          calendar.summary = item.name;
          calendar.isPrimary = item.isDefaultCalendar
            ? item.isDefaultCalendar
            : false;
          calendar.calendarType = CalendarTypeEnum.Office365Calendar;
          calendar.owner = user;
          return calendar;
        });

        return await manager
          .getRepository(Calendar)
          .save(calendarSerializedList);
      },
    );
  }

  async syncGoogleCalendarEventList(user: User, manager?: EntityManager) {
    return transactionManagerWrapper(
      manager,
      this.calendarTokenRepository,
      async (manager) => {
        const token = await manager.getRepository(CalendarToken).findOne({
          owner: { id: user.id },
          calendarType: CalendarTypeEnum.GoogleCalendar,
        });

        if (!token) {
          throw new NotFoundException(
            'You have not calendar-event access token',
          );
        }

        const { accessToken } = token;

      return await manager.getRepository(CalendarEvent).save(delta.added);
    });

    const cal = await calendar.calendarList.list();

    // console.log('cal ', cal.data.items);

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
      const tokens = await this.getTokens(user, manager);
      const googleToken = tokens.googleToken;
      const outlookToken = tokens.outlookToken;

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
        const googleEventCreateRes = await googleCalendarClient.events.insert({
          calendarId: googleLocalPrimaryCalendar.calendarId,
          requestBody: {
            summary: eventBody.title,
            description: eventBody.description,
            start: { dateTime: eventBody.start, timeZone: 'GMT' },
            end: { dateTime: eventBody.end, timeZone: 'GMT' },
          },
        });

        googleEventId = googleEventCreateRes.data.id;
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
        const outlookEventCreateRes = await outlookCalendarClient
          .api(`/me/calendars/${outlookLocalPrimaryCalendar.calendarId}/events`)
          .post({
            subject: eventBody.title,
            bodyPreview: eventBody.description,
            body: {
              content: eventBody.description,
            },
            start: { dateTime: eventBody.start, timeZone: 'GMT' },
            end: { dateTime: eventBody.end, timeZone: 'GMT' },
          });

        outlookEventId = outlookEventCreateRes.id;
      }

      const event = new CalendarEvent();
      event.googleId = googleEventId || null;
      event.outlookId = outlookEventId || null;
      event.eventType = EventTypeEnum.EntanglesCalendarEvent;
      event.owner = user;
      event.start = eventBody.start ? new Date(eventBody.start) : null;
      event.end = eventBody.end ? new Date(eventBody.end) : null;
      event.title = eventBody.title || null;
      event.creator = user.email || null;
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

        await googleCalendarClient.events.delete({
          calendarId: googleLocalPrimaryCalendar.calendarId,
          eventId: event.googleId,
        });
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

        await outlookCalendarClient
          .api(
            `/me/calendars/${outlookLocalPrimaryCalendar.calendarId}/events/${event.outlookId}`,
          )
          .delete();
      }

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

        const resGoogle = await googleCalendarClient.events.update({
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
        isPrimary: true,
      });
    const existedGoogleWebhookChannel =
      await calendarWebhookChannelRepo.findOne({
        owner: { id: user.id },
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
    manager: EntityManager,
  ) {
    const calendarWebhookChannelRepo = manager.getRepository(
      CalendarWebhookChannel,
    );
    const outlookCalendarClient = await this.getOutlookCredentials(token);

    const existedOutlookWebhookChannel =
      await calendarWebhookChannelRepo.findOne({
        owner: { id: user.id },
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
    token: CalendarToken,
    manager?: EntityManager,
  ) {
    return transactionManagerWrapper(
      manager,
      this.calendarWebhookChannelRepository,
      async (manager) => {
        const googleCalendarClient = await this.getGoogleCredentials(
          token.accessToken,
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

        const googleLocalPrimaryCalendar = await manager
          .getRepository(Calendar)
          .findOne({
            owner: { id: user.id },
            calendarType: CalendarTypeEnum.GoogleCalendar,
            isPrimary: true,
          });

        const watchResponse = await googleCalendarClient.events.watch({
          requestBody: {
            id: googleLocalPrimaryCalendar.id,
            type: 'web_hook',
            address: `${baseUrl}/api/calendar/events/google-webhook`,
            token: token.accessToken,
            expiration: null,
          },
          calendarId: googleLocalPrimaryCalendar.calendarId,
        });

        const webhookResourceId = watchResponse.data.resourceId;
        const webhookExpiration = +watchResponse.data.expiration;

        const webhookChannel = new CalendarWebhookChannel();
        webhookChannel.channelId = webhookResourceId;
        webhookChannel.expirationDate = new Date(webhookExpiration);
        webhookChannel.owner = user;
        webhookChannel.calendarType = CalendarTypeEnum.GoogleCalendar;

        await calendarWebhookChannelRepo.save(webhookChannel);
      },
    );
  }

  async outlookEventWatcher(user: User, token, manager?: EntityManager) {
    const outlookCalendarClient = await this.getOutlookCredentials(token);

    const calendarWebhookChannelRepo = manager.getRepository(
      CalendarWebhookChannel,
    );

    // const outlookLocalPrimaryCalendar = await manager
    //   .getRepository(Calendar)
    //   .findOne({
    //     owner: { id: user.id },
    //     calendarType: CalendarTypeEnum.Office365Calendar,
    //     isPrimary: true,
    //   });

    const tunnel = await locaTunnel({
      port: +this.configService.get<string>('PORT'),
    });

    const baseUrl =
      this.configService.get<string>('NODE_ENVIRONMENT') === 'development'
        ? tunnel.url
        : this.configService.get<string>('WEB_PRODUCTION_HOST');

    // const watchCloseResponse = await outlookCalendarClient
    //   .api('/subscriptions/f48dac3f-04db-032a-1c1c-f10a6c40057e')
    //   .delete();

    const watchResponse = await outlookCalendarClient
      .api('/subscriptions')
      .post({
        changeType: 'deleted,updated,created',
        notificationUrl: `${baseUrl}/api/calendar/events/outlook-webhook`,
        resource: 'me/events',
        expirationDateTime: new Date(Date.now() + 250560000).toISOString(),
      });

    // console.log('watchResponse ', watchResponse);

    const webhookChannel = new CalendarWebhookChannel();
    webhookChannel.channelId = watchResponse.id;
    webhookChannel.expirationDate = new Date(watchResponse.expirationDateTime);
    webhookChannel.owner = user;
    webhookChannel.calendarType = CalendarTypeEnum.Office365Calendar;

    await calendarWebhookChannelRepo.save(webhookChannel);
  }

  async getWebhookByChannelId(channel: string | string[]) {
    return this.calendarWebhookChannelRepository.findOne({
      where: { channelId: channel },
      relations: ['owner'],
    });
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

  private async getTokens(user: User, manager) {
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
}
