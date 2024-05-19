import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { IResponse } from 'src/components/interfaces/response.interface';
import { GetUser } from 'src/components/decorators/get-user.decorator';
import { ZoomService } from './zoom/zoom.service';
import { User } from '@user/entity/user.entity';
import { IntegrationsService } from './integrations.service';

@ApiBearerAuth()
@ApiTags('Integration')
@Controller('api/integrations')
export class IntegrationsController {
  constructor(
    private readonly zoomService: ZoomService,
    private readonly integrationsService: IntegrationsService,
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
  async create(@GetUser() user: User, @Query('code') code) {
    return this.zoomService.saveOAuthToken(user, code);
  }

  @ApiResponse({ type: IResponse })
  @ApiOperation({ summary: 'Get user linked integrations' })
  @UseGuards(AuthGuard())
  @Get('linked-integrations')
  async getLinkedIntegrations(@GetUser() user: User) {
    return this.integrationsService.getLinkedIntegrations(user);
  }
}
