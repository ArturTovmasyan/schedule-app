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
import { transactionManagerWrapper } from '../components/helpers/dbTransactionManager';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(CalendarToken)
    private readonly calendarTokenRepository: Repository<CalendarToken>,
    @InjectRepository(Calendar)
    private readonly calendarRepository: Repository<Calendar>,
    @InjectRepository(CalendarEvent)
    private readonly calendarEventRepository: Repository<CalendarEvent>,
    private readonly clientsCredentials: ClientsCredentialsService,
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
          throw new NotFoundException('You have not calendar access token');
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
          throw new NotFoundException('You have not calendar access token');
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
          throw new NotFoundException('You have not calendar access token');
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

    console.log('tasks ', tasks.data.items);

    console.log('events ', events.data.items);
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
      const googleToken = await manager.getRepository(CalendarToken).findOne({
        owner: { id: user.id },
        calendarType: CalendarTypeEnum.GoogleCalendar,
      });
      const outlookToken = await manager.getRepository(CalendarToken).findOne({
        owner: { id: user.id },
        calendarType: CalendarTypeEnum.Office365Calendar,
      });

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
      return a.updatedOn === b.updatedOn;
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
}
