import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CalendarToken } from './entity/calendarToken.entity';
import { Calendar } from '../calendar-event/entities/calendar.entity';
import { TokensByCalendar } from './types/statusOfCalendars.type';
import { ConfigService } from '@nestjs/config';
import * as msal from '@azure/msal-node';
import { transactionManagerWrapper } from '../../components/helpers/dbTransactionManager';
import { CalendarTypeEnum } from './enums/calendarType.enum';
import { UserDto } from '@user/dto/user.dto';
import { ConfidentialClientApplication } from '@azure/msal-node/dist/client/ConfidentialClientApplication';
import { CryptoProvider } from '@azure/msal-node/dist/crypto/CryptoProvider';
import { User } from '@user/entity/user.entity';
import { CalendarEventService } from '../calendar-event/calendar-event.service';
import { ClientsCredentialsService } from '../clients-credentials/clients-credentials.service';
import { google, oauth2_v2 } from 'googleapis';
import { GaxiosPromise } from 'googleapis/build/src/apis/abusiveexperiencereport';
import { CalendarData } from './types/calendar-data.type';

@Injectable()
export class CalendarPermissionsService {
  // googleOAuth2Client: Auth.OAuth2Client;
  msalInstance: ConfidentialClientApplication;
  msalCryptoProvider: CryptoProvider;

  constructor(
    @InjectRepository(CalendarToken)
    private readonly calendarTokenRepository: Repository<CalendarToken>,
    private readonly configService: ConfigService,
    private readonly calendarEventService: CalendarEventService,
    private readonly clientsCredentials: ClientsCredentialsService,
  ) {
    // const googleClientID = this.configService.get<string>('GOOGLE_CLIENT_ID');
    // const googleClientSecret = this.configService.get<string>(
    //   'GOOGLE_CLIENT_SECRET',
    // );
    // const googleClientURL = this.configService.get<string>(
    //   'GOOGLE_CALENDAR_CALLBACK_URL',
    // );
    // this.googleOAuth2Client = new google.auth.OAuth2(
    //   googleClientID,
    //   googleClientSecret,
    //   googleClientURL,
    // );

    const msalConfig = {
      clientId: this.configService.get<string>('MICROSOFT_CLIENT_ID'),
      authority:
        this.configService.get<string>('MICROSOFT_CLOUD_INSTANCE') +
        this.configService.get<string>('MICROSOFT_TENANT_ID'),
      clientSecret: this.configService.get<string>('MICROSOFT_CLIENT_SECRET'),
    };

    this.msalInstance = new msal.ConfidentialClientApplication({
      auth: msalConfig,
    });
    this.msalCryptoProvider = new msal.CryptoProvider();
  }

  /**
   * @description `Get main unfo of Google user`
   * @param accessToken - `Token of google access`
   * @returns `Google user data`
   */

  private async getGoogleUsersInfo(
    accessToken: string,
  ): GaxiosPromise<oauth2_v2.Schema$Userinfo> {
    await this.clientsCredentials.googleOAuth2Client.setCredentials({
      access_token: accessToken,
    });
    return await google.oauth2('v2').userinfo.v2.me.get({
      auth: this.clientsCredentials.googleOAuth2Client,
    });
  }

  async connectGoogleCalendar() {
    const statusOfCalendarsAndUrl: {
      url: null | string;
      statusOfCalendars: null | object;
    } = {
      url: null,
      statusOfCalendars: null,
    };

    const existingTokens = await this.calendarTokenRepository.findOne({
      where: {
        owner: user.id,
        calendarType: CalendarTypeEnum.GoogleCalendar,
      },
    });

    if (existingTokens?.refreshToken) {
      await this.calendarTokenRepository.manager.transaction(
        async (manager) => {
          await this.calendarEventService.stopGoogleWebhookChannel(
            user,
            existingTokens.accessToken,
            manager,
          );
          const resRevokeToken =
            await this.clientsCredentials.googleOAuth2Client.revokeToken(
              existingTokens.refreshToken,
            );

          if (resRevokeToken.status === 200) {
            await manager.getRepository(CalendarToken).delete({
              owner: { id: user.id },
              calendarType: CalendarTypeEnum.GoogleCalendar,
            });
          }
        },
      );
      statusOfCalendarsAndUrl.statusOfCalendars =
        await this.getUserStatusOfCalendars(user.id);

      return statusOfCalendarsAndUrl;
    }

    statusOfCalendarsAndUrl.url = this.googleOAuth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'openid',
        'profile',
        'email',
        'https://www.googleapis.com/auth/calendar',
      ],
    });

    return statusOfCalendarsAndUrl;
  }

  async disconnectGoogleCalendar(user: User, calendarId: string) {
    const statusOfCalendarsAndUrl: {
      url: null | string;
      statusOfCalendars: null | object;
    } = {
      url: null,
      statusOfCalendars: null,
    };

    const existingTokens = await this.calendarTokenRepository.findOne({
      where: {
        owner: user.id,
        calendarType: CalendarTypeEnum.GoogleCalendar,
        ownerEmail: calendarId
      },
    });

    if (existingTokens?.refreshToken) {
      await this.calendarTokenRepository.manager.transaction(
        async (manager) => {
          await this.calendarEventService.stopGoogleWebhookChannel(
            user,
            existingTokens.accessToken,
            calendarId,
            manager,
          );
          const resRevokeToken =
            await this.clientsCredentials.googleOAuth2Client.revokeToken(
              existingTokens.refreshToken,
            );

          if (resRevokeToken.status === 200) {
            await manager.getRepository(Calendar).delete({
              owner: { id: user.id },
              calendarId: calendarId,
              calendarType: CalendarTypeEnum.GoogleCalendar,
            });
            
            await manager.getRepository(CalendarToken).delete({
              owner: { id: user.id },
              ownerEmail: calendarId,
              calendarType: CalendarTypeEnum.GoogleCalendar,
            });
          }
        },
      );
      statusOfCalendarsAndUrl.statusOfCalendars =
        await this.getUserStatusOfCalendars(user.id);

      return statusOfCalendarsAndUrl;
    }

    return statusOfCalendarsAndUrl;
  }

  async getTokensFromGoogleAndSave(user: User, code: string) {
    return this.calendarTokenRepository.manager.transaction(async (manager) => {
      const calendarTokenRepository = manager.getRepository(CalendarToken);
      let getTokenResponse;
      try {
        getTokenResponse =
          await this.clientsCredentials.googleOAuth2Client.getToken(code);
      } catch (err) {
        throw new BadGatewayException(`${err.message}: try new code`);
      }

      if (getTokenResponse.res.status !== 200) {
        throw new BadGatewayException();
      }
      const tokens = getTokenResponse.tokens;

      const ownerEmail = (await this.getGoogleUsersInfo(tokens.access_token))
        .data.email;

      const expiryDate = new Date(tokens.expiry_date).toISOString();

      const calendarTokenBody = {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token ? tokens.refresh_token : null,
            expiryDate,
            calendarType: CalendarTypeEnum.GoogleCalendar,
            owner: { id: user.id },
            ownerEmail,
          };

      const token = await calendarTokenRepository.save(calendarTokenBody);

      const calendar = await this.calendarEventService.getCalendarsFromGoogle(user, token, manager);
      await this.calendarEventService.googleEventWatcher(user, calendar, manager);
      await this.calendarEventService.syncGoogleCalendarEventList(user, calendar, manager);

      return this.getUserStatusOfCalendars(user.id, manager);
    });
  }

  async connectMS365Calendar() {
    const statusOfCalendarsAndUrl: {
      url: null | string;
      statusOfCalendars: null | object;
    } = {
      url: null,
      statusOfCalendars: null,
    };

    const existingTokens = await this.calendarTokenRepository.findOne({
      where: {
        owner: user.id,
        calendarType: CalendarTypeEnum.Office365Calendar,
      },
    });

    if (existingTokens?.refreshToken) {
      await this.calendarTokenRepository.manager.transaction(
        async (manager) => {
          await this.calendarEventService.stopOutlookWebhookChannel(
            user,
            existingTokens.accessToken,
            manager,
          );

          await manager.getRepository(CalendarToken).delete({
            owner: { id: user.id },
            calendarType: CalendarTypeEnum.Office365Calendar,
          });
        },
      );
      await this.calendarTokenRepository.delete({
        owner: { id: user.id },
        calendarType: CalendarTypeEnum.Office365Calendar,
      });

      statusOfCalendarsAndUrl.statusOfCalendars =
        await this.getUserStatusOfCalendars(user.id);

      return statusOfCalendarsAndUrl;
    }
    statusOfCalendarsAndUrl.url = await this.msalInstance.getAuthCodeUrl({
      scopes: [
        'offline_access',
        'Calendars.ReadWrite',
        'openid',
        'profile',
        'User.Read',
      ],
      redirectUri: this.configService.get<string>(
        'MICROSOFT_CALENDAR_CALLBACK_URL',
      ),
    });

    return statusOfCalendarsAndUrl;
  }

  async getTokensFromMS365AndSave(user: User, code: string) {
    return this.calendarTokenRepository.manager.transaction(async (manager) => {
      const calendarTokenRepository = manager.getRepository(CalendarToken);

      const tokenResponse = await this.msalInstance.acquireTokenByCode({
        code,
        scopes: [
          'offline_access',
          'Calendars.ReadWrite',
          'openid',
          'profile',
          'User.Read',
        ],
        redirectUri: this.configService.get<string>(
          'MICROSOFT_CALENDAR_CALLBACK_URL',
        ),
      });

      if (!tokenResponse.accessToken) {
        throw new BadGatewayException();
      }

      const tokenCache = this.msalInstance.getTokenCache().serialize();

      const refreshTokenObject = JSON.parse(tokenCache).RefreshToken;

      const refreshToken =
        refreshTokenObject[Object.keys(refreshTokenObject)[0]].secret;

      const calendarTokenBody = {
            accessToken: tokenResponse.accessToken,
            refreshToken,
            expiryDate: tokenResponse.expiresOn,
            extExpiryDate: tokenResponse.extExpiresOn,
            calendarType: CalendarTypeEnum.Office365Calendar,
            owner: { id: user.id },
            ownerEmail: tokenResponse.account.username,
          };

      await calendarTokenRepository.save(calendarTokenBody);

      this.msalInstance.clearCache();

      const token = await calendarTokenRepository.save(calendarTokenBody);
      const calendar = await this.calendarEventService.getCalendarsFromOutlook(user, token, manager);

      await this.calendarEventService.outlookEventWatcher(user, calendar, manager);
      await this.calendarEventService.syncOutlookCalendarEventList(user, calendar, manager);

      return this.getUserStatusOfCalendars(user.id, manager);
    });
  }

  async getUserCalendars(user: User, manager?: EntityManager) {
    return transactionManagerWrapper(
      manager,
      this.calendarTokenRepository,
      async (manager) => {
        const userCalendars: CalendarData = {
          googleCalendar: [],
          office365Calendar: []
        };

        const calendars = await manager
          .getRepository(Calendar)
          .find({ where: { owner: user.id } });
        
          calendars.map((calendar) => {
            if (calendar.calendarType === CalendarTypeEnum.GoogleCalendar.valueOf()) {
              userCalendars.googleCalendar.push(calendar);
            } else if (calendar.calendarType === CalendarTypeEnum.Office365Calendar.valueOf()) {
              userCalendars.office365Calendar.push(calendar);
            }
          });
        return userCalendars;
      },
    );
  }

  async getUserStatusOfCalendars(userId: string, manager?: EntityManager) {
    return transactionManagerWrapper(
      manager,
      this.calendarTokenRepository,
      async (manager) => {
        const tokensByCalendar: TokensByCalendar = {
          googleCalendar: false,
          office365Calendar: false,
          exchangeCalendar: false,
          outlookPlugIn: false,
          iCloudCalendar: false,
        };

        const calendarTokens = await manager
          .getRepository(CalendarToken)
          .find({ where: { owner: userId } });
        calendarTokens.forEach((item) => {
          switch (item.calendarType) {
            case 'GoogleCalendar':
              tokensByCalendar.googleCalendar = true;
              break;
            case 'Office365Calendar':
              tokensByCalendar.office365Calendar = true;
              break;
            case 'ExchangeCalendar':
              tokensByCalendar.exchangeCalendar = true;
              break;
            case 'OutlookPlugIn':
              tokensByCalendar.outlookPlugIn = true;
              break;
            case 'iCloudCalendar':
              tokensByCalendar.iCloudCalendar = true;
              break;
          }
        });
        return tokensByCalendar;
      },
    );
  }
}
