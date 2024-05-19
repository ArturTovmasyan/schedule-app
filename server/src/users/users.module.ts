import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@user/entity/user.entity';
import { CalendarAccess } from 'src/calendar-access/entities/calendar-access.entity';
import { InvitationModule } from 'src/invitation/invitation.module';
import { Invitation } from 'src/invitation/entities/invitation.entity';

@Module({
  imports: [
    InvitationModule,
    TypeOrmModule.forFeature([User, CalendarAccess, Invitation]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
