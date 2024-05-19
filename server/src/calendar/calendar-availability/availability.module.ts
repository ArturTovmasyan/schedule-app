import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AvailabilityController } from './availability.controller';
import { Availability } from './entities/availability.entity';
import { AvailabilityService } from './availability.service';
import {CalendarEvent} from "../calendar-event/entities/calendarEvent.entity";
import {CalendarEventService} from "../calendar-event/calendar-event.service";
import {CalendarToken} from "../calendar-permissions/entity/calendarToken.entity";
import {CalendarWebhookChannel} from "../calendar-event/entities/calendarWebhookChannel.entity";
import {Calendar} from "../calendar-event/entities/calendar.entity";
import {ClientsCredentialsService} from "../clients-credentials/clients-credentials.service";
import {ConfigService} from "@nestjs/config";

@Module({
  imports: [
    TypeOrmModule.forFeature([Availability, CalendarEvent, Calendar, CalendarToken,CalendarWebhookChannel]),//TODO optimize
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AvailabilityController],
  providers: [AvailabilityService, CalendarEventService, ClientsCredentialsService, ConfigService],
})
export class AvailabilityModule {}
