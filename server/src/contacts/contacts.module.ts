import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { ClientsCredentialsModule } from 'src/calendar/clients-credentials/clients-credentials.module';
import { CalendarEvent } from 'src/calendar/calendar-event/entities/calendarEvent.entity';
import { CalendarEventModule } from 'src/calendar/calendar-event/calendar-event.module';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { User } from '@user/entity/user.entity';

@Module({
  imports: [
    CalendarEventModule,
    TypeOrmModule.forFeature([User, CalendarEvent]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule,
    ClientsCredentialsModule,
  ],
  controllers: [ContactsController],
  providers: [ContactsService],
})
export class ContactsModule {}
