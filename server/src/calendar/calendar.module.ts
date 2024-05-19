import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarToken } from '../calendar-permissions/entity/calendarToken.entity';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { ClientsCredentialsModule } from '../clients-credentials/clients-credentials.module';
import { CalendarPermissionsModule } from '../calendar-permissions/calendarPermissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule,
    ClientsCredentialsModule,
    CalendarPermissionsModule,
  ],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
