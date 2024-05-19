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
import { UpdateAccessTokenInterceptor } from '../calendar-accessibility/interceptors/updateAccessToken.interceptor';

@ApiBearerAuth()
@ApiTags('Calendar permissions')
@Controller('api/calendar-permissions')
export class CalendarPermissionsController {
  constructor(
    private readonly calendarPermissionsService: CalendarPermissionsService,
  ) {}

  @ApiResponse({ type: IResponse })
  @ApiOperation({ summary: 'Check status of calendars' })
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

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Toggle google calendar' })
  @Get('google-calendar')
  @UseGuards(AuthGuard())
  async googleCalendar(@Req() req: { user: User }, @Res() res: Response) {
    const { url, statusOfCalendars } =
      await this.calendarPermissionsService.toggleGoogleCalendar(req.user);
    if (url) {
      return res.redirect(url);
    }
    return res.send(statusOfCalendars);
  }

  @ApiExcludeEndpoint()
  @Get('google-calendar-callback')
  @UseGuards(AuthGuard())
  async googleCalendarCallback(
    @Req() req: { user: User },
    @Query() query: any,
  ) {
    return await this.calendarPermissionsService.getTokensFromGoogleAndSave(
      req.user,
      query.code,
    );
  }

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Toggle microsoft calendar' })
  @Get('ms-calendar')
  @UseGuards(AuthGuard())
  async ms365Calendar(@Req() req: { user: User }, @Res() res: Response) {
    const { url, statusOfCalendars } =
      await this.calendarPermissionsService.toggleMS365Calendar(req.user);
    if (url) {
      return res.redirect(url);
    }
    return res.send(statusOfCalendars);
  }

  @ApiExcludeEndpoint()
  @Get('ms-calendar-callback')
  @UseGuards(AuthGuard())
  async ms365CalendarCallback(@Req() req: { user: User }, @Query() query: any) {
    return await this.calendarPermissionsService.getTokensFromMS365AndSave(
      req.user,
      query.code,
    );
  }
}
