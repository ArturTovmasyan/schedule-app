import { forwardRef, Module } from '@nestjs/common';
import { CalendarEventController } from './calendar-event.controller';
import { CalendarEventService } from './calendar-event.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarToken } from '../calendar-permissions/entity/calendarToken.entity';
import { PassportModule } from '@nestjs/passport';
import { ClientsCredentialsModule } from '../clients-credentials/clients-credentials.module';
import { CalendarPermissionsModule } from '../calendar-permissions/calendarPermissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ClientsCredentialsModule,
    forwardRef(() => CalendarPermissionsModule),
  ],
  controllers: [CalendarEventController],
  providers: [CalendarEventService],
  exports: [CalendarEventService],
})
export class CalendarEventModule {}
