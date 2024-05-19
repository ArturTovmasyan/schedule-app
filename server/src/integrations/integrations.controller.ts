import { Controller, Get, Post, Query, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@user/entity/user.entity';
import * as moment from 'moment';
import { GetUser } from 'src/components/decorators/get-user.decorator';
import { IResponse } from 'src/components/interfaces/response.interface';
import { ZoomService } from './zoom/zoom.service';

@ApiBearerAuth()
@ApiTags('Integration')
@Controller('api/integrations')
export class IntegrationsController {
  constructor(
    private readonly zoomService: ZoomService,
    private readonly configService: ConfigService,
  ) {}

  @ApiResponse({ type: IResponse })
  @ApiOperation({ summary: 'Integrate zoom account' })
  @UseGuards(AuthGuard())
  // @UseInterceptors(UpdateZoomOAuthTokenInterceptor)
  @Post('zoom/oauth')
  async zoomOAuth(@GetUser() user: User) {
    const url = this.zoomService.getAuthUrl();
    return { data: { url: url } };
  }

  @ApiExcludeEndpoint()
  @UseGuards(AuthGuard())
  // @UseInterceptors(UpdateZoomOAuthTokenInterceptor)
  @Get('zoom/oauth/callback')
  async create(
    @GetUser() user: User,
    @Query('code') code,
    @Req() req,
    @Res() res,
  ) {
    if (code) {
      try {
        const data = await this.zoomService.getAccessTokenWithAuthCode(code);
        this.zoomService.saveOAuthToken(user, {
          accessToken: data['access_token'],
          refreshToken: data['refresh_token'],
          expiryDate: moment().add(data['expires_in'], 's').toDate(),
        });

        res.json({ message: 'Zoom account has been integrated' });
      } catch (error) {
        res.json({ error: error.message }, 500);
      }
    }
    res.json({ error: 'Auth code not provided' }, 400);
  }
}
