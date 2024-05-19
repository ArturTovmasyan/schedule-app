import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { CalendarAccess } from 'src/calendar/calendar-access/entities/calendar-access.entity';
import { CalendarAccessModule } from 'src/calendar/calendar-access/calendar-access.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { AccessRequestController } from './access-request.controller';
import { AccessRequest } from './entities/access-request.entity';
import { AccessRequestService } from './access-request.service';
import { MailModule } from 'src/mail/mail.module';
import { User } from '@user/entity/user.entity';

@Module({
  imports: [
    MailModule,
    NotificationsModule,
    CalendarAccessModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([AccessRequest, CalendarAccess, User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AccessRequestController],
  providers: [AccessRequestService],
})
export class AccessRequestModule {}
