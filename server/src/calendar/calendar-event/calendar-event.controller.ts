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
  Res,
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
  constructor(private readonly calendarEventService: CalendarEventService) {}

  @Get()
  @UseGuards(AuthGuard())
  @UseInterceptors(UpdateAccessTokenInterceptor)
  async getUserCalendarEvents(
    @Req() req: { user: User },
    @Query() query: TimeIntervalDto,
  ) {
    return await this.calendarEventService.getUserCalendarEvents(
      req.user,
      query,
    );
  }

  @Post()
  @UseGuards(AuthGuard())
  @UseInterceptors(UpdateAccessTokenInterceptor)
  async createUserCalendarEvent(
    @Req() req: { user: User },
    @Body() body: CreateEventDto,
  ) {
    return await this.calendarEventService.createUserCalendarEvent(
      req.user,
      body,
    );
  }

  @Put(':id')
  @UseGuards(AuthGuard())
  @UseInterceptors(UpdateAccessTokenInterceptor)
  async updateUserCalendarEvent(
    @Req() req: { user: User },
    @Param('id') eventId: string,
    @Body() body: UpdateEventDto,
  ) {
    return await this.calendarEventService.updateUserCalendarEvent(
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
    return await this.calendarEventService.deleteUserCalendarEvent(
      req.user,
      eventId,
    );
  }

  @Post('google-webhook')
  async forGoogleWebhook(@Req() req: Request, @Res() res: Response) {
    const resourceId = req.headers['x-goog-resource-id'];
    const resourceState = req.headers['x-goog-resource-state'];

    const webhook = await this.calendarEventService.getWebhookByChannelId(
      resourceId,
    );
    await this.calendarEventService.syncGoogleCalendarEventList(webhook.owner);

    if (resourceState === 'sync') {
      return res.status(200).send();
    }
  }

  @Post('outlook-webhook')
  // @UseGuards(AuthGuard())
  // @UseInterceptors(UpdateWebhookInterceptor)
  async forOutlookWebhook(
    @Query() query,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    console.log('req ', req.body);
    // console.log('req route stack', req.route.stack);

    res.status(200);
    res.send(query.validationToken);
  }
}
