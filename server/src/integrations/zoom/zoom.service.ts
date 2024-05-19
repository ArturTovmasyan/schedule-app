import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ZoomOAuthToken } from './entity/zoom-oauth-token.entity';
import { User } from '@user/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ZoomService {
  ZOOM_GET_AUTHCODE = 'https://zoom.us/oauth/token';
  ZOOM_AUTH = 'https://zoom.us/oauth/authorize?response_type=code&client_id=';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(ZoomOAuthToken)
    private readonly zoomRepo: Repository<ZoomOAuthToken>,
  ) {}

  getAuthUrl(): string {
    return `${this.ZOOM_AUTH}${this.configService.get(
      'ZOOM_CLIENT_ID',
    )}&redirect_uri=${this.configService.get('ZOOM_OAUTH_REDIRECT_URL')}`;
  }

  getAuthCodeUrlWithAuthCode(authCode: string) {
    return `${
      this.ZOOM_GET_AUTHCODE
    }?grant_type=authorization_code&code=${authCode}&redirect_uri=${this.configService.get(
      'ZOOM_OAUTH_REDIRECT_URL',
    )}`;
  }

  getAuthCodeUrlWithRefreshToken(token: string) {
    return `${this.ZOOM_GET_AUTHCODE}?grant_type=refresh_token&refresh_token=${token}`;
  }

  saveOAuthToken(
    user: User,
    data: {
      id?: number;
      accessToken: string;
      refreshToken: string;
      expiryDate: Date;
    },
  ) {
    return this.zoomRepo.save({
      user: { id: user.id },
      ...data,
    });
  }

  async getAccessTokenWithAuthCode(authCode: string) {
    return new Promise((resolve, reject) => {
      const basicAuth =
        'Basic ' +
        Buffer.from(
          this.configService.get('ZOOM_CLIENT_ID') +
            ':' +
            this.configService.get('ZOOM_CLIENT_SECRET'),
        ).toString('base64');
      this.httpService
        .post(encodeURI(this.getAuthCodeUrlWithAuthCode(authCode)), null, {
          headers: {
            Authorization: basicAuth,
          },
        })
        .subscribe({
          next: (response: any) => {
            resolve(response.data);
          },
          error: (error) => {
            reject(error);
          },
        });
    });
  }

  async getAccessTokenWithRefreshToken(refreshToken: string) {
    return new Promise((resolve, reject) => {
      const basicAuth =
        'Basic ' +
        Buffer.from(
          this.configService.get('ZOOM_CLIENT_ID') +
            ':' +
            this.configService.get('ZOOM_CLIENT_SECRET'),
        ).toString('base64');
      this.httpService
        .post(
          encodeURI(this.getAuthCodeUrlWithRefreshToken(refreshToken)),
          null,
          {
            headers: {
              Authorization: basicAuth,
            },
          },
        )
        .subscribe({
          next: (response: any) => {
            resolve(response.data);
          },
          error: (error) => {
            reject(error);
          },
        });
    });
  }
}
