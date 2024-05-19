import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CalendarToken } from '../calendar-permissions/entity/calendarToken.entity';
import { Repository } from 'typeorm';
import { ClientsCredentialsService } from '../clients-credentials/clients-credentials.service';
import { CalendarTypeEnum } from '../calendar-permissions/enums/calendarType.enum';
import { google } from 'googleapis';
import * as graph from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(CalendarToken)
    private readonly calendarTokenRepository: Repository<CalendarToken>,
    private readonly clientsCredentials: ClientsCredentialsService,
  ) {}

  async getFromGoogle(userId: string) {
    const { accessToken } = await this.calendarTokenRepository.findOne({
      owner: { id: userId },
      calendarType: CalendarTypeEnum.GoogleCalendar,
    });

    await this.clientsCredentials.googleOAuth2Client.setCredentials({
      access_token: accessToken,
    });
    const calendar = google.calendar({
      version: 'v3',
      auth: this.clientsCredentials.googleOAuth2Client,
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

    // console.log('accessToken ', accessToken);

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
}
