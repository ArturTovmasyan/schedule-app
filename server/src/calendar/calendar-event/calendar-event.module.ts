import { forwardRef, Module } from '@nestjs/common';
import { CalendarEventController } from './calendar-event.controller';
import { CalendarEventService } from './calendar-event.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarToken } from '../calendar-permissions/entity/calendarToken.entity';
import { PassportModule } from '@nestjs/passport';
import { ClientsCredentialsModule } from '../clients-credentials/clients-credentials.module';
import { CalendarPermissionsModule } from '../calendar-permissions/calendarPermissions.module';
<<<<<<< HEAD
=======
import { Calendar } from './entities/calendar.entity';
import { CalendarToken } from '../calendar-permissions/entity/calendarToken.entity';
import { CalendarEvent } from './entities/calendarEvent.entity';
import { CalendarWebhookChannel } from './entities/calendarWebhookChannel.entity';
import { CalendarService } from '../calendar.service';
import { ZoomService } from 'src/integrations/zoom/zoom.service';
import { HttpModule } from '@nestjs/axios';
>>>>>>> e38a4ff (fix: refactor zoom integration on scheduling meeting)

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ClientsCredentialsModule,
    forwardRef(() => CalendarPermissionsModule),
    HttpModule,
  ],
  controllers: [CalendarEventController],
  providers: [CalendarEventService, CalendarService, ZoomService],
  exports: [CalendarEventService],
})
export class CalendarEventModule {}
