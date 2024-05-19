import { map } from 'rxjs';
import * as moment from 'moment';
import { Connection } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, Injectable } from '@nestjs/common';

import { ErrorMessages } from 'src/components/constants/error.messages';
import { ZoomOAuthToken } from './entity/zoom-oauth-token.entity';
import {
  IZoomMeetingResponse,
  IZoomTokenResponse,
  IZoomMeeting,
} from './interfaces/zoom.interface';
import { User } from '@user/entity/user.entity';
import {
  IResponseMessage,
  IResponse,
} from 'src/components/interfaces/response.interface';
import {
  ZOOM_GET_AUTHCODE,
  ZOOM_MEETING,
  ZOOM_AUTH,
} from 'src/components/constants/zoom.const';

@Injectable()
export class ZoomService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly connection: Connection,
  ) {}

  getAuthUrl(): string {
    return `${ZOOM_AUTH}${this.configService.get(
      'ZOOM_CLIENT_ID',
    )}&redirect_uri=${this.configService.get('ZOOM_OAUTH_REDIRECT_URL')}`;
  }

  getAuthCodeUrlWithAuthCode(authCode: string): string {
    return `${ZOOM_GET_AUTHCODE}?grant_type=authorization_code&code=${authCode}&redirect_uri=${this.configService.get(
      'ZOOM_OAUTH_REDIRECT_URL',
    )}`;
  }

  getAuthCodeUrlWithRefreshToken(token: string): string {
    return `${ZOOM_GET_AUTHCODE}?grant_type=refresh_token&refresh_token=${token}`;
  }

  /**
   * @description `Save zoom oauth token`
   *
   * @param user - `Authorized user data`
   * @param code - `Code from zoom callback`
   *
   * @returns `Zoom account has been integrated`
   */

  async saveOAuthToken(user: User, code: string): Promise<IResponseMessage> {
    if (!code) {
      throw new BadRequestException({
        message: ErrorMessages.authCodeNotProvided,
      });
    }
    const data = (await this.getAccessTokenWithAuthCode(code)).data;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.getRepository(ZoomOAuthToken).save({
        user: { id: user.id },
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiryDate: moment().add(data.expires_in, 's').toDate(),
      });

      await queryRunner.commitTransaction();

      return { message: `Zoom account has been integrated`, status: 1 };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw new BadRequestException({ message: error.message });
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * @description `Get zoom access token form db and updated if expired`
   * @param user - `Authorized user data`
   * @returns - `updated auth token`
   */

  private async _getZoomTokenFromDb(
    user: User,
  ): Promise<IResponse<ZoomOAuthToken>> {
    const token = await this.connection
      .getRepository(ZoomOAuthToken)
      .findOne({ where: { user: { id: user.id } } });

    if (!token) {
      throw new BadRequestException({
        message: ErrorMessages.zoomTokenNotFound,
      });
    }

    if (new Date(token.expiryDate).getTime() < new Date(Date.now()).getTime()) {
      const newToken = (
        await this.getAccessTokenWithRefreshToken(token.refreshToken)
      ).data;

      await this.connection.getRepository(ZoomOAuthToken).update(
        { id: token.id },
        {
          accessToken: newToken.access_token,
          refreshToken: newToken.refresh_token,
          expiryDate: moment().add(newToken.expires_in, 's').toDate(),
        },
      );

      token.accessToken = newToken.access_token;
      token.refreshToken = newToken.refresh_token;
      token.expiryDate = moment().add(newToken.expires_in, 's').toDate();
    }

    return { data: token };
  }

  /**
   * @description `Get zoom access token using auth code`
   * @param authCode - `authcode from zoom`
   * @returns `zoom access token object`
   */

  async getAccessTokenWithAuthCode(
    authCode: string,
  ): Promise<IResponse<IZoomTokenResponse>> {
    const basicAuth =
      'Basic ' +
      Buffer.from(
        this.configService.get('ZOOM_CLIENT_ID') +
          ':' +
          this.configService.get('ZOOM_CLIENT_SECRET'),
      ).toString('base64');

    const data = await this.httpService
      .post(encodeURI(this.getAuthCodeUrlWithAuthCode(authCode)), null, {
        headers: {
          Authorization: basicAuth,
        },
      })
      .pipe(map((res) => res.data))
      .toPromise();

    return { data: data as IZoomTokenResponse, metadata: {} };
  }

  /**
   * @description `Create Zoom Meeting`
   *
   * @param user - `User Data`
   * @param meeting - `Meeting data(start,end dates,attendees,etc...)`
   *
   * @returns `Created Meeting data`
   */

  async createMeeting(
    user: User,
    meeting: IZoomMeeting,
  ): Promise<IResponse<IZoomMeetingResponse>> {
    const token = (await this._getZoomTokenFromDb(user)).data;
    if (!token) {
      throw new BadRequestException({
        message: ErrorMessages.zoomTokenNotFound,
      });
    }

    const bearerAuth = 'Bearer ' + token.accessToken;

    const data = await this.httpService
      .post(encodeURI(ZOOM_MEETING), meeting, {
        headers: {
          Authorization: bearerAuth,
        },
      })
      .pipe(map((res) => res.data))
      .toPromise();

    return { data, metadata: {} };
  }

  /**
   * @description `Delete zoom meeting`
   *
   * @param user - `Authorized user`
   * @param meetingId - `ID of meeting`
   *
   * @returns `Deleted`
   */

  async deleteMeeting(
    user: User,
    meetingId: string,
  ): Promise<IResponse<IZoomMeetingResponse>> {
    const token = (await this._getZoomTokenFromDb(user)).data;
    if (!token) {
      throw new BadRequestException({
        message: ErrorMessages.zoomTokenNotFound,
      });
    }

    const bearerAuth = 'Bearer ' + token.accessToken;

    const data = await this.httpService
      .delete(encodeURI(ZOOM_MEETING + `/${meetingId}`), {
        headers: {
          Authorization: bearerAuth,
        },
      })
      .pipe(map((res) => res.data))
      .toPromise();

    return { data, metadata: {} };
  }

  /**
   * @description `Get access token using refresh token`
   * @param refreshToken  - `Refresh token from DB`
   * @returns `New granted token object`
   */

  async getAccessTokenWithRefreshToken(
    refreshToken: string,
  ): Promise<IResponse<IZoomTokenResponse>> {
    const basicAuth =
      'Basic ' +
      Buffer.from(
        this.configService.get('ZOOM_CLIENT_ID') +
          ':' +
          this.configService.get('ZOOM_CLIENT_SECRET'),
      ).toString('base64');

    const data = await this.httpService
      .post(
        encodeURI(this.getAuthCodeUrlWithRefreshToken(refreshToken)),
        null,
        {
          headers: {
            Authorization: basicAuth,
          },
        },
      )
      .pipe(map((res) => res.data))
      .toPromise()
      .catch((e) => {
        console.log(e);
      });

    return { data: data as IZoomTokenResponse, metadata: {} };
  }
}
