import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import AzureAdOAuth2Strategy from 'passport-azure-ad-oauth2';
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
    console.log('request ', request);
    console.log('accessToken ', accessToken);
    console.log('refreshToken ', refreshToken);
    console.log('profile ', profile);
    console.log('done ', done);
    try {
      done(null, profile);
    } catch (err) {
      done(err, false);
    }
  }
}

// export class AzureADStrategy extends PassportStrategy(
//     BearerStrategy,
//     'oauth-bearer',
// ) {
//   constructor() {
//     super({
//       identityMetadata:
//           'https://login.microsoftonline.com/88d0f86a-6a15-4c30-9ad9-ded490a01b5f',
//       clientID: '8e86c1a1-9dd3-4334-9b6a-e1da7ecbedc8 ',
//     });
//   }
//
//   async validate(response: any) {
//     const { unique_name }: { unique_name: string } = response;
//     if (unique_name) return unique_name;
//     else return null;
//   }
// }
