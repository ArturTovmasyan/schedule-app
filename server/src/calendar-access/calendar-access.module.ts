import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { CalendarAccessController } from './calendar-access.controller';
import { CalendarAccess } from './entities/calendar-access.entity';
import { CalendarAccessService } from './calendar-access.service';
import { User } from '@user/entity/user.entity';
import { MailModule } from 'src/mail/mail.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MailModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([CalendarAccess, User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [CalendarAccessController],
  providers: [CalendarAccessService],
})
export class CalendarAccessModule {}
