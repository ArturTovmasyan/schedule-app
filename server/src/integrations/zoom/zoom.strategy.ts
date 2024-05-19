import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { ZoomService } from './zoom.service';

@Injectable()
export class ZoomStrategy extends PassportStrategy(Strategy, 'zoom') {
  clientID = 'insert-client-id';
  clientSecret = 'insert-client-secret';
  callbackURL = 'http://localhost:8080/auth/discord';
  ZOOM_GET_AUTHCODE = 'https://zoom.us/oauth/token';
  ZOOM_AUTH = 'https://zoom.us/oauth/authorize?response_type=code&client_id=';

  constructor(
    private readonly configService: ConfigService,
    private readonly zoomService: ZoomService,
  ) {
    super({
      authorizationURL: 'https://zoom.us/oauth/authorize',
      tokenURL: 'https://zoom.us/oauth/token',
      clientID: configService.get('ZOOM_CLIENT_ID'),
      clientSecret: configService.get('ZOOM_CLIENT_SECRET'),
      callbackURL: configService.get('ZOOM_OAUTH_REDIRECT_URL'),
      scope: null,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile, done) {
    try {
      done(null, profile);
    } catch (err) {
      done(err, false);
    }
  }
}
