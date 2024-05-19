import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { CalendarAccess } from 'src/calendar/calendar-access/entities/calendar-access.entity';
import { CalendarAccessModule } from 'src/calendar/calendar-access/calendar-access.module';
import { AccessRequest } from 'src/access-request/entities/access-request.entity';
import { AccessRequestModule } from 'src/access-request/access-request.module';
import { InvitationController } from './invitation.controller';
import { Invitation } from './entities/invitation.entity';
import { InvitationService } from './invitation.service';
import { MailModule } from 'src/mail/mail.module';
import { User } from '@user/entity/user.entity';

@Module({
  imports: [
    MailModule,
    CalendarAccessModule,
    AccessRequestModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([User, CalendarAccess, Invitation, AccessRequest]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [InvitationController],
  providers: [InvitationService],
  exports: [InvitationService],
})
export class InvitationModule {}
