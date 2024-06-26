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
import { Request, Response } from 'express';
import { GetUser } from '../../components/decorators/get-user.decorator';

@ApiBearerAuth()
@ApiTags('Calendar Event')
@Controller('api/calendar')
export class CalendarEventController {
  constructor(private readonly calendarEventService: CalendarEventService) {}

  @Get()
  @UseGuards(AuthGuard())
  // @UseInterceptors(UpdateWebhookInterceptor)
  // @UseInterceptors(UpdateAccessTokenInterceptor)
  async getUserCalendarEvents(
    @GetUser() user,
    @Query() query: TimeIntervalDto,
  ) {
    return await this.calendarEventService.getUserCalendarEvents(
      user.id,
      query,
    );
  }

  @Get(':contactId')
  @UseGuards(AuthGuard())
  async getContactEvents(
      @Param('contactId') contactId: string,
      @Query() query: TimeIntervalDto,
  ) {
    return await this.calendarEventService.getUserCalendarEvents(
        contactId,
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
    @Body() body: { message: string },
  ) {
    return await this.calendarEventService.deleteUserCalendarEvent(
      req.user,
      eventId,
      body.message,
    );
  }

  @Post('google-webhook')

  async forGoogleWebhook(@Req() req: Request, @Res() res: Response) {
    const resourceId = req.headers['x-goog-resource-id'];
    const resourceState = req.headers['x-goog-resource-state'];

    const webhookChannel = await this.calendarEventService.getWebhookByChannelId(
      resourceId,
    );
    setTimeout(async () => {
      console.log('forGoogleWebhook');

      await this.calendarEventService.syncGoogleCalendarEventList(
        webhook.owner,
      );
    }, 1000);

    if (resourceState === 'sync') {
      return res.status(200).send();
    }

    setTimeout(async () => {
      await this.calendarEventService.syncGoogleCalendarEventList(
        webhookChannel.owner,
        webhookChannel.calendar,
      );
    }, 1000);

    res.status(200).send();
  }

  @Post('outlook-webhook')
  async forOutlookWebhook(
    @Query() query,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (req.body.value) {
      const resourceId = req.body.value[0].subscriptionId;
      const webhookChannel =
        await this.calendarEventService.getWebhookByChannelId(resourceId);

      setTimeout(async () => {
        console.log('forOutlookWebhook');
        await this.calendarEventService.syncOutlookCalendarEventList(
          webhookChannel.owner,
          webhookChannel.calendar,
        );
      }, 1000);
    }

    res.status(200);
    res.send(query.validationToken);
  }
}
