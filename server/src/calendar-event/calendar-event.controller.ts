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
import { CalendarEventService } from './calendar-event.service';
import { AuthGuard } from '@nestjs/passport';
import TimeIntervalDto from './dto/timeInterval.dto';
import CreateEventDto from './dto/createEvent.dto';
import UpdateEventDto from './dto/updateEvent.dto';
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";

@ApiBearerAuth()
@ApiTags('Calendar Event')
@Controller('api/calendar/events')
export class CalendarEventController {
  constructor(private readonly calendarService: CalendarEventService) {}

  @Get()
  @UseGuards(AuthGuard())
  @UseInterceptors(UpdateAccessTokenInterceptor)
  async getUserCalendarEvents(
    @Req() req: { user: User },
    @Query() query: TimeIntervalDto,
  ) {
    return await this.calendarService.getUserCalendarEvents(req.user, query);
  }

  @Post()
  @UseGuards(AuthGuard())
  @UseInterceptors(UpdateAccessTokenInterceptor)
  async createUserCalendarEvent(
    @Req() req: { user: User },
    @Body() body: CreateEventDto,
  ) {
    return await this.calendarService.createUserCalendarEvent(req.user, body);
  }

  @Put(':id')
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

  @Delete(':id')
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
