import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as AzureAdOAuth2Strategy from 'passport-azure-ad-oauth2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AzureADStrategy extends PassportStrategy(
  AzureAdOAuth2Strategy,
  'microsoft',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('MICROSOFT_CLIENT_ID'),
      clientSecret: configService.get<string>('MICROSOFT_CLIENT_SECRET'),
      callbackURL: configService.get<string>('MICROSOFT_CALLBACK_URL'),
      resource: '00000002-0000-0000-c000-000000000000',
      tenant: configService.get<string>('MICROSOFT_TENANT_ID'),
    });
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile,
    done: Function,
  ) {
    try {
      done(null, profile);
    } catch (err) {
      done(err, false);
    }
  }
}
