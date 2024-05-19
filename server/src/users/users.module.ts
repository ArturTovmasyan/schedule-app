import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@user/entity/user.entity';
import { CalendarAccess } from 'src/calendar/calendar-access/entities/calendar-access.entity';
import { InvitationModule } from 'src/invitation/invitation.module';
import { Invitation } from 'src/invitation/entities/invitation.entity';
import { FileUploadService } from 'src/components/services/file-upload.service';
import { InvitationPendingEmails } from 'src/invitation/entities/invitation-pending-emails.entity';
import { CalendarAccessModule } from 'src/calendar/calendar-access/calendar-access.module';
import { AccessRequestModule } from 'src/access-request/access-request.module';

@Module({
  imports: [
    InvitationModule,
    AccessRequestModule,
    CalendarAccessModule,
    TypeOrmModule.forFeature([
      User,
      Invitation,
      CalendarAccess,
      InvitationPendingEmails,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [UsersService, FileUploadService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
