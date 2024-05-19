import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@user/entity/user.entity';
import { CalendarPermissionsService } from './calendarPermissions.service';
import { TokensByCalendar } from './types/statusOfCalendars.type';
import { Response } from 'express';
import { UpdateAccessTokenInterceptor } from '../common/helpers/updateAccessToken.interceptor';

@Controller('calendar-permissions')
export class CalendarPermissionsController {
  constructor(
    private readonly calendarPermissionsService: CalendarPermissionsService,
  ) {}

  @Get('status-of-calendars')
  @UseGuards(AuthGuard())
  @UseInterceptors(UpdateAccessTokenInterceptor)
  async getUserCalendarPermissions(
    @Req() req: { user: User },
  ): Promise<TokensByCalendar> {
    return await this.calendarPermissionsService.getUserStatusOfCalendars(
      req.user.id,
    );
  }

  @Get('google-calendar')
  // @UseGuards(AuthGuard())
  async googleCalendar(@Req() req: { user: User }, @Res() res: Response) {
    req.user = { ...req.user, id: '947344d9-7a3b-416d-b17d-bf6626988c16' };
    const { url, statusOfCalendars } =
      await this.calendarPermissionsService.toggleGoogleCalendar(req.user);
    if (url) {
      return res.redirect(url);
    }
    return res.send(statusOfCalendars);
  }

  @Get('google-calendar-callback')
  // @UseGuards(AuthGuard())
  async googleCalendarCallback(
    @Req() req: { user: User },
    @Query() query: any,
  ) {
    req.user = { ...req.user, id: '947344d9-7a3b-416d-b17d-bf6626988c16' };

    return await this.calendarPermissionsService.getTokensFromGoogleAndSave(
      req.user,
      query.code,
    );
  }

  @Get('ms-calendar')
  // @UseGuards(AuthGuard())
  async ms365Calendar(@Req() req: { user: User }, @Res() res: Response) {
    req.user = { ...req.user, id: '947344d9-7a3b-416d-b17d-bf6626988c16' };

    const { url, statusOfCalendars } =
      await this.calendarPermissionsService.toggleMS365Calendar(req.user);
    if (url) {
      return res.redirect(url);
    }
    return res.send(statusOfCalendars);
  }

  @Get('ms-calendar-callback')
  // @UseGuards(AuthGuard())
  async ms365CalendarCallback(@Req() req: { user: User }, @Query() query: any) {
    req.user = { ...req.user, id: '947344d9-7a3b-416d-b17d-bf6626988c16' };

    return await this.calendarPermissionsService.getTokensFromMS365AndSave(
      req.user,
      query.code,
    );
  }
}
