import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CalendarToken } from './entity/calendarToken.entity';
import { TokensByCalendar } from './types/statusOfCalendars.type';
import { ConfigService } from '@nestjs/config';
import { Auth, google } from 'googleapis';
import * as msal from '@azure/msal-node';
import { transactionManagerWrapper } from '../common/helpers/dbTransactionManager';
import { CalendarTypeEnum } from './enums/calendarType.enum';
import { UserDto } from '@user/dto/user.dto';
import { ConfidentialClientApplication } from '@azure/msal-node/dist/client/ConfidentialClientApplication';
import { CryptoProvider } from '@azure/msal-node/dist/crypto/CryptoProvider';

@Injectable()
export class CalendarPermissionsService {
  googleOAuth2Client: Auth.OAuth2Client;
  msalInstance: ConfidentialClientApplication;
  msalCryptoProvider: CryptoProvider;

  constructor(
    @InjectRepository(CalendarToken)
    private readonly calendarTokenRepository: Repository<CalendarToken>,
    private readonly configService: ConfigService,
  ) {
    const googleClientID = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const googleClientSecret = this.configService.get<string>(
      'GOOGLE_CLIENT_SECRET',
    );
    const googleClientURL = this.configService.get<string>(
      'GOOGLE_CALENDAR_CALLBACK_URL',
    );
    this.googleOAuth2Client = new google.auth.OAuth2(
      googleClientID,
      googleClientSecret,
      googleClientURL,
    );

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

  async toggleGoogleCalendar(user: UserDto) {
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
      const resRevokeToken = await this.googleOAuth2Client.revokeToken(
        existingTokens.accessToken,
      );
      if (resRevokeToken.status === 200) {
        await this.calendarTokenRepository.delete({
          owner: { id: user.id },
          calendarType: CalendarTypeEnum.GoogleCalendar,
        });
      }

      const statusOfCalendars = await this.getUserStatusOfCalendars(user.id);

      statusOfCalendarsAndUrl.statusOfCalendars = statusOfCalendars;

      return statusOfCalendarsAndUrl;
    }

    const url = this.googleOAuth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'openid',
        'profile',
        'email',
        'https://www.googleapis.com/auth/calendar',
      ],
    });

    statusOfCalendarsAndUrl.url = url;
    return statusOfCalendarsAndUrl;
  }

  async getTokensFromGoogleAndSave(user: UserDto, code: string) {
    return this.calendarTokenRepository.manager.transaction(async (manager) => {
      const calendarTokenRepository = manager.getRepository(CalendarToken);
      const getTokenResponse = await this.googleOAuth2Client.getToken(code);

      if (getTokenResponse.res.headers.status !== 200) {
        throw new BadGatewayException();
      }
      const tokens = getTokenResponse.tokens;

      const expiryDate = new Date(tokens.expiry_date).toISOString();

      const calendarTokenBody = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ? tokens.refresh_token : null,
        expiryDate,
        calendarType: CalendarTypeEnum.GoogleCalendar,
        owner: { id: user.id },
      };

      await calendarTokenRepository.save(calendarTokenBody);

      return this.getUserStatusOfCalendars(user.id, manager);
    });
  }

  async toggleMS365Calendar(user: UserDto) {
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
      await this.calendarTokenRepository.delete({
        owner: { id: user.id },
        calendarType: CalendarTypeEnum.Office365Calendar,
      });

      const statusOfCalendars = await this.getUserStatusOfCalendars(user.id);

      statusOfCalendarsAndUrl.statusOfCalendars = statusOfCalendars;

      return statusOfCalendarsAndUrl;
    }
    const url = await this.msalInstance.getAuthCodeUrl({
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
    statusOfCalendarsAndUrl.url = url;
    return statusOfCalendarsAndUrl;
  }

  async getTokensFromMS365AndSave(user: UserDto, code: string) {
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
      };

      await calendarTokenRepository.save(calendarTokenBody);

      this.msalInstance.clearCache();

      return this.getUserStatusOfCalendars(user.id, manager);
    });
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
