import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CalendarToken } from '../calendar-permissions/entity/calendarToken.entity';
import { Repository } from 'typeorm';
import { ClientsCredentialsService } from '../clients-credentials/clients-credentials.service';
import { CalendarTypeEnum } from '../calendar-permissions/enums/calendarType.enum';
import { google } from 'googleapis';
import * as graph from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import { Calendar } from './entities/calendar.entity';
import { User } from '@user/entity/user.entity';
import { CalendarEvent } from './entities/calendarEvent.entity';

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

  async getCalendarsFromGoogle(user: User) {
    return this.calendarTokenRepository.manager.transaction(async (manager) => {
      const token = await manager.getRepository(CalendarToken).findOne({
        owner: { id: user.id },
        calendarType: CalendarTypeEnum.GoogleCalendar,
      });

      if (!token) {
        throw new NotFoundException('You have not calendar access token');
      }

      const { accessToken } = token;

      await this.clientsCredentials.googleOAuth2Client.setCredentials({
        access_token: accessToken,
      });
      const calendar = google.calendar({
        version: 'v3',
        auth: this.clientsCredentials.googleOAuth2Client,
      });

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

      return await manager.getRepository(Calendar).save(calendarSerializedList);
    });
  }

  async getCalendarsFromOutlook(user: User) {
    return this.calendarTokenRepository.manager.transaction(async (manager) => {
      const token = await manager.getRepository(CalendarToken).findOne({
        owner: { id: user.id },
        calendarType: CalendarTypeEnum.Office365Calendar,
      });
      if (!token) {
        throw new NotFoundException('You have not calendar access token');
      }

      const { accessToken } = token;

      const client = graph.Client.init({
        authProvider: (done) => {
          done(null, accessToken);
        },
      });
      const calendarList = await client
        .api('https://graph.microsoft.com/v1.0/me/calendars/')
        .get();

      console.log('calendarList ', calendarList);

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

      return await manager.getRepository(Calendar).save(calendarSerializedList);
    });
  }

  // const createEvents = await calendar.events.insert();

  // const tasks = google.tasks({
  //   version: 'v1',
  //   auth: this.clientsCredentials.googleOAuth2Client,
  // });
  // console.log('before');
  //
  // const tasksData = await tasks.tasklists.list();
  // console.log('after');

  async syncGoogleCalendarEventList(user: User) {
    return this.calendarTokenRepository.manager.transaction(async (manager) => {
      const token = await manager.getRepository(CalendarToken).findOne({
        owner: { id: user.id },
        calendarType: CalendarTypeEnum.GoogleCalendar,
      });

      if (!token) {
        throw new NotFoundException('You have not calendar access token');
      }

      const { accessToken } = token;

      await this.clientsCredentials.googleOAuth2Client.setCredentials({
        access_token: accessToken,
      });

      const calendar = google.calendar({
        version: 'v3',
        auth: this.clientsCredentials.googleOAuth2Client,
      });

      const localPrimaryCalendar = await manager
        .getRepository(Calendar)
        .findOne({
          owner: { id: user.id },
          calendarType: CalendarTypeEnum.GoogleCalendar,
          isPrimary: true,
        });

      const eventsFromDb = await manager.getRepository(CalendarEvent).find({
        owner: { id: user.id },
        calendarType: CalendarTypeEnum.GoogleCalendar,
      });

      const events = await calendar.events.list({
        calendarId: localPrimaryCalendar.calendarId,
        timeZone: 'GMT',
      });

      const serializedEvents = events.data.items.map((item) => {
        const event = new CalendarEvent();
        event.eventId = item.id;
        event.calendarType = CalendarTypeEnum.GoogleCalendar;
        event.owner = user;
        event.start = item.start.dateTime
          ? new Date(item.start.dateTime)
          : null;
        event.end = item.start.dateTime ? new Date(item.end.dateTime) : null;
        event.title = item.summary || null;
        event.creator = item.creator.email || null;
        event.meetLink = item.hangoutLink || null;
        event.createdOn = new Date(item.created);
        event.updatedOn = new Date(item.updated);
        event.description = item.description || null;

        return event;
      });

      const delta = this.compareEvents(eventsFromDb, serializedEvents);

      return await manager.getRepository(CalendarEvent).save(delta.added);
    });
  }

  async syncOutlookCalendarEventList(user: User) {
    return this.calendarTokenRepository.manager.transaction(async (manager) => {
      const token = await manager.getRepository(CalendarToken).findOne({
        owner: { id: user.id },
        calendarType: CalendarTypeEnum.Office365Calendar,
      });

      if (!token) {
        throw new NotFoundException('You have not calendar access token');
      }

      const { accessToken } = token;

      const calendarClient = graph.Client.init({
        authProvider: (done) => {
          done(null, accessToken);
        },
      });

      const localPrimaryCalendar = await manager
        .getRepository(Calendar)
        .findOne({
          owner: { id: user.id },
          calendarType: CalendarTypeEnum.Office365Calendar,
          isPrimary: true,
        });

      const eventsFromDb = await manager.getRepository(CalendarEvent).find({
        owner: { id: user.id },
        calendarType: CalendarTypeEnum.GoogleCalendar,
      });

      const events = await calendarClient
        .api(`/me/calendars/${localPrimaryCalendar.calendarId}/events`)
        .get();

      const serializedEvents = events.value.map((item) => {
        const event = new CalendarEvent();
        event.eventId = item.id;
        event.calendarType = CalendarTypeEnum.Office365Calendar;
        event.owner = user;
        event.start = item.start.dateTime
          ? new Date(item.start.dateTime)
          : null;
        event.end = item.start.dateTime ? new Date(item.end.dateTime) : null;
        event.title = item.subject || null;
        event.creator = item.organizer.emailAddress.address || null;
        event.meetLink = item.onlineMeeting || null;
        event.createdOn = new Date(item.createdDateTime);
        event.updatedOn = new Date(item.lastModifiedDateTime);
        event.description = item.bodyPreview || null;

        return event;
      });

      const delta = this.compareEvents(eventsFromDb, serializedEvents);

      return await manager.getRepository(CalendarEvent).save(delta.added);
    });

    console.log('before');

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

  private compareEvents(eventsFromDb, eventsFromGoogle) {
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
    ): { added: Array<any>; deleted: Array<any>; changed: Array<any> } {
      const delta = {
        added: <Array<any>>[],
        deleted: <Array<any>>[],
        changed: <Array<any>>[],
      };
      const mapO = mapFromArray(o, 'eventId');
      const mapN = mapFromArray(n, 'eventId');
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

    return getDelta(eventsFromDb, eventsFromGoogle, isEqualEvent);
  }
}
