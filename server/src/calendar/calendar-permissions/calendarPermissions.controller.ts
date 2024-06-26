import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@user/entity/user.entity';
import { CalendarPermissionsService } from './calendarPermissions.service';
import { TokensByCalendar } from './types/statusOfCalendars.type';
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
  // @UseGuards(AuthGuard())
  async googleCalendar(@Req() req: { user: User }, @Res() res: Response) {
    req.user = { ...req.user, id: '4748fcf0-ac95-41f5-82f3-9d03fb1298f5' };
    const { url, statusOfCalendars } =
    await this.calendarPermissionsService.toggleGoogleCalendar(req.user);

    if (url) {
      return { data: { url: url } };
    }

    return statusOfCalendars;
  }

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Disconnect google calendar' })
  @Post('google-calendar/revoke')
  @UseGuards(AuthGuard())
  @UseInterceptors(UpdateAccessTokenInterceptor)
  async disconnectGoogleCalendar(
    @GetUser() user: User,
    @Body() revokeCalendarDto: RevokeCalendarDto,
  ) {
    const { url, statusOfCalendars } =
      await this.calendarPermissionsService.disconnectGoogleCalendar(
        user,
        revokeCalendarDto.calendarId,
      );

    if (url) {
      return { data: { url: url } };
    }

    return statusOfCalendars;
  }

  @ApiExcludeEndpoint()
  @Get('google-calendar-callback')
  // @UseGuards(AuthGuard())
  async googleCalendarCallback(
    @Req() req: { user: User },
    @Query() query: any,
  ) {
    req.user = { ...req.user, id: '4748fcf0-ac95-41f5-82f3-9d03fb1298f5' };

    return await this.calendarPermissionsService.getTokensFromGoogleAndSave(
      req.user,
      query.code,
    );
  }

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Toggle microsoft calendar' })
  @Get('ms-calendar')
  // @UseGuards(AuthGuard())
  async ms365Calendar(@Req() req: { user: User }, @Res() res: Response) {
    req.user = { ...req.user, id: '4748fcf0-ac95-41f5-82f3-9d03fb1298f5' };

    const { url, statusOfCalendars } =
      await this.calendarPermissionsService.toggleMS365Calendar(req.user);
    if (url) {
      return { data: { url: url } };
    }

    return statusOfCalendars;
  }

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Disconnect microsoft calendar' })
  @Post('ms-calendar/revoke')
  @UseGuards(AuthGuard())
  @UseInterceptors(UpdateAccessTokenInterceptor)
  async disconnectMS365Calendar(
    @GetUser() user: User,
    @Body() revokeCalendarDto: RevokeCalendarDto,
  ) {
    const { url, statusOfCalendars } =
      await this.calendarPermissionsService.disconnectOffice365Calendar(
        user,
        revokeCalendarDto.calendarId,
      );

    if (url) {
      return { data: { url: url } };
    }

    return statusOfCalendars;
  }

  @ApiExcludeEndpoint()
  @Get('ms-calendar-callback')
  @UseGuards(AuthGuard())
  async ms365CalendarCallback(@Req() req: { user: User }, @Query() query: any) {
    req.user = { ...req.user, id: '4748fcf0-ac95-41f5-82f3-9d03fb1298f5' };
    return await this.calendarPermissionsService.getTokensFromMS365AndSave(
      req.user,
      query.code,
    );
  }
}
