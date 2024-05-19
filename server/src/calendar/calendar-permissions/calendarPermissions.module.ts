import { forwardRef, Module } from '@nestjs/common';
import { CalendarPermissionsController } from './calendarPermissions.controller';
import { CalendarPermissionsService } from './calendarPermissions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarToken } from './entity/calendarToken.entity';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@user/users.module';
import { CalendarEventModule } from '../calendar-event/calendar-event.module';
import { ClientsCredentialsModule } from '../clients-credentials/clients-credentials.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UsersModule,
    forwardRef(() => CalendarEventModule),
    ClientsCredentialsModule,
  ],
  controllers: [CalendarPermissionsController],
  providers: [CalendarPermissionsService],
  exports: [CalendarPermissionsService],
})
export class CalendarPermissionsModule {}
