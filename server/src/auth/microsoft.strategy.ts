import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as AzureAdOAuth2Strategy from 'passport-azure-ad-oauth2';
import { ConfigService } from '@nestjs/config';
import * as graph from '@microsoft/microsoft-graph-client';

@Injectable()
export class AzureADStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(
    private readonly configService: ConfigService, // private readonly clientsCredentialsService: ClientsCredentialsService,
  ) {
    super({
      scope: ['offline_access', 'openid', 'profile', 'User.Read'],
      authorizationURL:
        'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      clientID: configService.get<string>('MICROSOFT_CLIENT_ID'),
      clientSecret: configService.get<string>('MICROSOFT_CLIENT_SECRET'),
      callbackURL: configService.get<string>('MICROSOFT_CALLBACK_URL'),
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
      const microsoftClient = graph.Client.init({
        authProvider: (done) => {
          done(null, accessToken);
        },
      });

      const user = await microsoftClient.api('/me/').get();
      done(null, user);
    } catch (err) {
      done(err, false);
    }
  }
}
