import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { CalendarAccessibilityController } from './calendar-accessibility.controller';
import { CalendarAccessibility } from './entities/calendar-accessibility.entity';
import { CalendarAccessibilityService } from './calendar-accessibility.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarAccessibility]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [CalendarAccessibilityController],
  providers: [CalendarAccessibilityService],
})
export class CalendarAccessibilityModule {}
