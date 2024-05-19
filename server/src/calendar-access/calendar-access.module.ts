import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { CalendarAccessController } from './calendar-access.controller';
import { CalendarAccess } from './entities/calendar-access.entity';
import { CalendarAccessService } from './calendar-access.service';
import { MailModule } from 'src/mail/mail.module';
import { User } from '@user/entity/user.entity';

@Module({
  imports: [
    MailModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([CalendarAccess, User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [CalendarAccessController],
  providers: [CalendarAccessService],
  exports: [CalendarAccessService],
})
export class CalendarAccessModule {}