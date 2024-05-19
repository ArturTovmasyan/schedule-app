import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { InvitationPendingEmails } from './entities/invitation-pending-emails.entity';
import { InvitationController } from './invitation.controller';
import { Invitation } from './entities/invitation.entity';
import { InvitationService } from './invitation.service';
import { MailModule } from 'src/mail/mail.module';
import { User } from '@user/entity/user.entity';

@Module({
  imports: [
    MailModule,
    TypeOrmModule.forFeature([User, Invitation, InvitationPendingEmails]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [InvitationController],
  providers: [InvitationService],
  exports: [InvitationService],
})
export class InvitationModule {}
