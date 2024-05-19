import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { CalendarEvent } from 'src/calendar/calendar-event/entities/calendarEvent.entity';
import { SharableLinkAttendeesEntity } from './entities/sharable-link-attendees.entity';
import { CalendarEventModule } from 'src/calendar/calendar-event/calendar-event.module';
import { SharableLinkSlotsEntity } from './entities/sharable-link-slots.entity';
import { IntegrationsModule } from 'src/integrations/integrations.module';
import { SharableLinksController } from './sharable-links.controller';
import { SharableLinkEntity } from './entities/sharable-link.entity';
import { SharableLinksService } from './sharable-links.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([
      SharableLinkEntity,
      SharableLinkAttendeesEntity,
      SharableLinkSlotsEntity,
      CalendarEvent,
    ]),
    CalendarEventModule,
    IntegrationsModule,
  ],
  controllers: [SharableLinksController],
  providers: [SharableLinksService],
})
export class SharableLinksModule {}
