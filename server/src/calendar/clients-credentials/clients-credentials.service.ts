import { Injectable } from '@nestjs/common';
import { Auth, google } from 'googleapis';
import { ConfidentialClientApplication } from '@azure/msal-node/dist/client/ConfidentialClientApplication';
import { CryptoProvider } from '@azure/msal-node/dist/crypto/CryptoProvider';
import { InjectRepository } from '@nestjs/typeorm';
import { CalendarToken } from '../calendar-permissions/entity/calendarToken.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as msal from '@azure/msal-node';

@Injectable()
export class ClientsCredentialsService {
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
}
