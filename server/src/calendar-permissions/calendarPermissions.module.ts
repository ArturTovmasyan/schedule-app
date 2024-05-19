import { forwardRef, Module } from '@nestjs/common';
import { CalendarPermissionsController } from './calendarPermissions.controller';
import { CalendarPermissionsService } from './calendarPermissions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarToken } from './entity/calendarToken.entity';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '@user/users.module';
import { CalendarModule } from '../calendar/calendar.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule,
    UsersModule,
    forwardRef(() => CalendarModule),
  ],
  controllers: [CalendarPermissionsController],
  providers: [CalendarPermissionsService],
  exports: [CalendarPermissionsService],
})
export class CalendarPermissionsModule {}
