import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CalendarToken } from '../calendar-permissions/entity/calendarToken.entity';
import { Repository } from 'typeorm';
import { ClientsCredentialsService } from '../clients-credentials/clients-credentials.service';
import { CalendarTypeEnum } from '../calendar-permissions/enums/calendarType.enum';
import { google } from 'googleapis';

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
    });

    console.log('events ', events.data.items);
  }
}
