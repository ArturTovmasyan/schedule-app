import {
  Controller,
  Get,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateAccessTokenInterceptor } from '../components/helpers/updateAccessToken.interceptor';
import { User } from '@user/entity/user.entity';
import { CalendarService } from './calendar.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('google')
  @UseGuards(AuthGuard())
  @UseInterceptors(UpdateAccessTokenInterceptor)
  async getUserGoogleCalendar(@Req() req: { user: User }) {
    req.user = { ...req.user, id: '947344d9-7a3b-416d-b17d-bf6626988c16' };
    return await this.calendarService.getFromGoogle(req.user.id);
  }

  @Get('ms')
  @UseGuards(AuthGuard())
  @UseInterceptors(UpdateAccessTokenInterceptor)
  async getUserMSCalendar(@Req() req: { user: User }) {
    req.user = { ...req.user, id: '947344d9-7a3b-416d-b17d-bf6626988c16' };
    return await this.calendarService.getFromMS(req.user.id);
  }
}
