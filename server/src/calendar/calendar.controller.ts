import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateAccessTokenInterceptor } from '../calendar-accessibility/interceptors/updateAccessToken.interceptor';
import { User } from '@user/entity/user.entity';
import { CalendarService } from './calendar.service';
import { AuthGuard } from '@nestjs/passport';
import TimeIntervalDto from './dto/timeInterval.dto';
import CreateEventDto from './dto/createEvent.dto';
import UpdateEventDto from './dto/updateEvent.dto';

@Controller('api/calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  //TODO remove this comments

  // @Get('google')
  // @UseGuards(AuthGuard())
  // @UseInterceptors(UpdateAccessTokenInterceptor)
  // async getUserGoogleCalendar(@Req() req: { user: User }) {
  //   // req.user = { ...req.user, id: '947344d9-7a3b-416d-b17d-bf6626988c16' };
  //   // req.user = { ...req.user, id: '526bcc4e-f73d-4c25-95e5-7f41053355e8' };
  //   return await this.calendarService.getCalendarsFromGoogle(req.user);
  // }
  //
  // @Get('google-events')
  // @UseGuards(AuthGuard())
  // @UseInterceptors(UpdateAccessTokenInterceptor)
  // async getUserGoogleCalendarEvents(@Req() req: { user: User }) {
  //   // req.user = { ...req.user, id: '947344d9-7a3b-416d-b17d-bf6626988c16' };
  //   // req.user = { ...req.user, id: '526bcc4e-f73d-4c25-95e5-7f41053355e8' };
  //   return await this.calendarService.syncGoogleCalendarEventList(req.user);
  // }
  //
  // @Get('ms-events')
  // @UseGuards(AuthGuard())
  // @UseInterceptors(UpdateAccessTokenInterceptor)
  // async getUserOutlookCalendarEvents(@Req() req: { user: User }) {
  //   // req.user = { ...req.user, id: '947344d9-7a3b-416d-b17d-bf6626988c16' };
  //   // req.user = { ...req.user, id: '526bcc4e-f73d-4c25-95e5-7f41053355e8' };
  //   return await this.calendarService.syncOutlookCalendarEventList(req.user);
  // }
  //
  // @Get('ms')
  // @UseGuards(AuthGuard())
  // @UseInterceptors(UpdateAccessTokenInterceptor)
  // async getUserMSCalendar(@Req() req: { user: User }) {
  //   return await this.calendarService.getCalendarsFromOutlook(req.user);
  // }

  @Get('events')
  @UseGuards(AuthGuard())
  @UseInterceptors(UpdateAccessTokenInterceptor)
  async getUserCalendarEvents(
    @Req() req: { user: User },
    @Query() query: TimeIntervalDto,
  ) {
    return await this.calendarService.getUserCalendarEvents(req.user, query);
  }

  @Post('events')
  @UseGuards(AuthGuard())
  @UseInterceptors(UpdateAccessTokenInterceptor)
  async createUserCalendarEvent(
    @Req() req: { user: User },
    @Body() body: CreateEventDto,
  ) {
    return await this.calendarService.createUserCalendarEvent(req.user, body);
  }

  @Put('events/:id')
  @UseGuards(AuthGuard())
  @UseInterceptors(UpdateAccessTokenInterceptor)
  async updateUserCalendarEvent(
    @Req() req: { user: User },
    @Param('id') eventId: string,
    @Body() body: UpdateEventDto,
  ) {
    return await this.calendarService.updateUserCalendarEvent(
      req.user,
      body,
      eventId,
    );
  }

  @Delete('events/:id')
  @UseGuards(AuthGuard())
  @UseInterceptors(UpdateAccessTokenInterceptor)
  async deleteUserCalendarEvent(
    @Req() req: { user: User },
    @Param('id') eventId: string,
  ) {
    return await this.calendarService.deleteUserCalendarEvent(
      req.user,
      eventId,
    );
  }
}
