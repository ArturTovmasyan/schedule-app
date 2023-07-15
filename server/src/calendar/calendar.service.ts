import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { google, calendar_v3 as gCal } from 'googleapis';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { CalendarToken } from './calendar-permissions/entity/calendarToken.entity';
import { ClientsCredentialsService } from './clients-credentials/clients-credentials.service';
import * as graph from '@microsoft/microsoft-graph-client';
import { CalendarTypeEnum } from './calendar-permissions/enums/calendarType.enum';
import { isTemplateMiddle } from 'typescript';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(CalendarToken)
    private readonly calendarTokenRepository: Repository<CalendarToken>,
    private readonly clientsCredentials: ClientsCredentialsService,
    private readonly configService: ConfigService,
  ) {}

  async initManager(
    accessToken: string,
    calendarType: CalendarTypeEnum = CalendarTypeEnum.GoogleCalendar,
  ) {
    let manager: EventManager;
    if (calendarType == CalendarTypeEnum.GoogleCalendar) {
      manager = new GogoleEventManager(
        accessToken,
        this.calendarTokenRepository,
        this.clientsCredentials,
        this.configService,
      );
    } else {
      manager = new OfficeEventManager(
        accessToken,
        this.calendarTokenRepository,
        this.clientsCredentials,
        this.configService,
      );
    }
    await manager.init();
    return manager;
  }
}

interface EventManager {
  init(): void;
  getEvent(calendarId: string, eventId: string);
  saveEvent(data: any, isUpdate: boolean, metaData: object | null);
  deleteEvent(calendarId: string, eventId: string, message: string);
  getAllEvents(calendarId: string, fromDate: string, timezone: string);
  getAllCalendars();
  createWebhook(internalCalendarId: string, externalCalendarId: string);
  removeWebhook(internalCalendarId: string, channelId: string);
  getAllWebhooks();
}

class GogoleEventManager implements EventManager {
  private googleClient: gCal.Calendar;

  constructor(
    private accessToken: string,
    private readonly calendarTokenRepository: Repository<CalendarToken>,
    private readonly clientsCredentials: ClientsCredentialsService,
    private configService: ConfigService,
  ) {}

  async init() {
    this.googleClient = await this.getGoogleCredentials(this.accessToken);
  }

  /**
   * @description `Get google access token of user`
   * @param accessToken - `Current token from DB`
   * @returns `Google authenticated client`
   */
  private async getGoogleCredentials(
    accessToken: string,
  ): Promise<gCal.Calendar> {
    const token = await this.calendarTokenRepository.findOne({
      where: { accessToken },
    });

    if (!token) {
      this.clientsCredentials.googleOAuth2Client.setCredentials({
        access_token: accessToken,
      });
    } else {
      this.clientsCredentials.googleOAuth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: token.refreshToken,
      });

      if (
        new Date(token.expiryDate).getTime() < new Date(Date.now()).getTime()
      ) {
        const newToken =
          await this.clientsCredentials.googleOAuth2Client.refreshAccessToken();

        await this.calendarTokenRepository.update(
          { id: token.id },
          {
            accessToken: newToken.credentials.access_token,
            refreshToken: newToken.credentials.refresh_token,
            expiryDate: new Date(newToken.credentials.expiry_date),
          },
        );
      }
    }

    return google.calendar({
      version: 'v3',
      auth: this.clientsCredentials.googleOAuth2Client,
    });
  }

  async getEvent(calendarId: string, eventId: string) {
    return new Promise(async (resolve) => {
      this.googleClient.events
        .get({
          calendarId: calendarId,
          eventId: eventId,
        })
        .then((event) => {
          resolve(event);
        })
        .catch((e) => {
          console.log('Failed to get event from GoogleCalendar', e);
          resolve(null);
        });
    });
  }

  async saveEvent(data: any, isUpdate = false, metaData: object | null) {
    return new Promise<gCal.Schema$Event>((resolve) => {
      const operation = isUpdate
        ? this.googleClient.events.update(data)
        : this.googleClient.events.insert(data);

      operation
        .then((res) => {
          resolve(res.data);
        })
        .catch((e) => {
          console.log('Failed to save event in GoogleCalendar', e);
          resolve(null);
        });
    });
  }

  async deleteEvent(calendarId: string, eventId: string, message: string) {
    return new Promise<void>(async (resolve) => {
      this.googleClient.events
        .delete({
          calendarId: calendarId,
          eventId: eventId,
        })
        .then(() => {
          resolve();
        })
        .catch((e) => {
          console.log('Failed to delete event in GoogleCalendar', e);
          resolve(null);
        });
    });
  }

  async getAllEvents(calendarId: string, fromDate: string, timezone = 'GMT') {
    return new Promise<gCal.Schema$Event[]>((resolve) => {
      this.googleClient.events
        .list({
          calendarId: calendarId,
          timeZone: timezone,
          timeMin: fromDate,
        })
        .then((res) => {
          resolve(res.data.items);
        })
        .catch((e) => {
          console.log('Failed to fetch events from GoogleCalendar', e);
          resolve([]);
        });
    });
  }

  async getAllCalendars() {
    return new Promise<gCal.Schema$CalendarListEntry[]>((resolve) => {
      this.googleClient.calendarList
        .list()
        .then((res) => {
          resolve(res.data.items);
        })
        .catch((e) => {
          console.log('Failed to fetch calendars from GoogleCalendar', e);
          resolve([]);
        });
    });
  }

  getAllWebhooks() {
    throw new Error('Method not implemented.');
  }

  async createWebhook(internalCalendarId: string, externalCalendarId: string) {
    const baseUrl = this.configService.get<string>('WEB_PRODUCTION_HOST');
    return new Promise<gCal.Schema$Channel>((resolve, reject) => {
      this.googleClient.events
        .watch({
          requestBody: {
            id: internalCalendarId,
            type: 'web_hook',
            address: `${baseUrl}/api/calendar/events/google-webhook`,
            token: this.accessToken,
            expiration: null,
          },
          calendarId: externalCalendarId,
        })
        .then((res) => {
          resolve(res.data);
        })
        .catch((e) => {
          console.log('Could not add a watcher for GoogleCalendar', e);
          reject(e);
        });
    });
  }

  async removeWebhook(internalCalendarId: string, channelId: string) {
    return new Promise<boolean>(async (resolve) => {
      this.googleClient.channels
        .stop({
          requestBody: {
            id: internalCalendarId,
            token: this.accessToken,
            resourceId: channelId,
          },
        })
        .then(() => {
          resolve(true);
        })
        .catch((e) => {
          console.log('Failed to remove webhook from GoogleCalendar', e);
          resolve(false);
        });
    });
  }
}

class OfficeEventManager implements EventManager {
  private officeClient: graph.Client;

  private async getOutlookCredentials(accessToken: string) {
    const token = await this.calendarTokenRepository.findOne({
      where: { accessToken },
    });

    if (token) {
      if (
        new Date(token.expiryDate).getTime() < new Date(Date.now()).getTime()
      ) {
        const newToken =
          await this.clientsCredentials.msalInstance.acquireTokenByRefreshToken(
            {
              refreshToken: token.refreshToken,
              scopes: [
                'offline_access',
                'Calendars.ReadWrite',
                'openid',
                'profile',
                'User.Read',
              ],
            },
          );

        await this.calendarTokenRepository.update(
          { id: token.id },
          {
            accessToken: newToken.accessToken,
            expiryDate: newToken.expiresOn,
            extExpiryDate: newToken.extExpiresOn,
          },
        );

        accessToken = newToken.accessToken;
      }
    }

    return graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  constructor(
    private accessToken: string,
    private readonly calendarTokenRepository: Repository<CalendarToken>,
    private readonly clientsCredentials: ClientsCredentialsService,
    private configService: ConfigService,
  ) {}

  async init() {
    this.officeClient = await this.getOutlookCredentials(this.accessToken);
  }

  getEvent(calendarId: string, eventId: string) {
    return new Promise((resolve) => {
      this.officeClient
        .api(`/me/events/${eventId}`)
        .header('Prefer', 'outlook.timezone="GMT"')
        .select(
          'subject,body,bodyPreview,organizer,attendees,start,end,location',
        )
        .get()
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          console.log('Failed to get event from Office365Calendar', e);
          resolve(null);
        });
    });
  }

  saveEvent(data: any, isUpdate: boolean, metaData: object | null) {
    return new Promise((resolve) => {
      const api = this.officeClient.api(
        `/me/calendars/${metaData['calendarId']}/events/${
          isUpdate ? metaData['eventId'] : ''
        }`,
      );
      const operation = isUpdate ? api.update(data) : api.post(data);
      operation
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          console.log('Failed to save event in Office365Calendar', e);
          resolve(null);
        });
    });
  }

  deleteEvent(calendarId: string, eventId: string, message: string) {
    return new Promise<void>((resolve) => {
      this.officeClient
        .api(`/me/calendars/${calendarId}/events/${eventId}/cancel`)
        .post({
          comment: message,
        })
        .finally(() => {
          this.officeClient
            .api(`/me/calendars/${calendarId}/events/${eventId}/cancel`)
            .post({
              comment: message,
            })
            .then(() => {
              resolve();
            })
            .catch((e) => {
              console.log('Failed to delete event in Office365Calendar', e);
              resolve();
            });
        });
    });
  }

  getAllEvents(calendarId: string, fromDate: string, timezone: string) {
    return new Promise(async (resolve) => {
      this.officeClient
        .api(`/me/calendars/${calendarId}/events`)
        .header('Prefer', `outlook.timezone="${timezone}"`)
        .get()
        .then((res) => {
          // console.log(
          //   res.value.map((item) => {
          //     return {
          //       title: item.subject,
          //       start: item.start,
          //       end: item.end,
          //     };
          //   }),
          // );
          resolve(res);
        })
        .catch((e) => {
          console.log('Failed to fetch events from Office365Calendar', e);
          resolve([]);
        });
    });
  }

  getAllCalendars() {
    return new Promise((resolve) => {
      this.officeClient
        .api('https://graph.microsoft.com/v1.0/me/calendars/')
        .get()
        .then((res) => {
          resolve(res.value);
        })
        .catch((e) => {
          console.log('Failed to fetch calendars from Office365Calendar', e);
          resolve([]);
        });
    });
  }

  async getAllWebhooks() {
    return this.officeClient.api('/subscriptions').get();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createWebhook(_internalCalendarId: string, externalCalendarId: string) {
    const baseUrl = this.configService.get<string>('WEB_PRODUCTION_HOST');
    return new Promise((resolve, reject) => {
      this.officeClient
        .api('/subscriptions')
        .post({
          changeType: 'deleted,updated,created',
          notificationUrl: `${baseUrl}/api/calendar/events/outlook-webhook`,
          resource: `me/calendars/${externalCalendarId}/events`,
          token: this.accessToken,
          expirationDateTime: new Date(Date.now() + 250560000).toISOString(),
        })
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          console.log('Could not add a watcher for Office365Calendar', e);
          reject(e);
        });
    });
  }

  removeWebhook(internalCalendarId: string, channelId: string) {
    return new Promise<boolean>(async (resolve) => {
      this.officeClient
        .api(`/subscriptions/${channelId}`)
        .delete()
        .then(() => {
          resolve(true);
        })
        .catch((e) => {
          console.log('Failed to remove webhook from Office365Calendar', e);
          resolve(false);
        });
    });
  }
}
