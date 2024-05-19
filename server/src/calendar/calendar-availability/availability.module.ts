import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { AvailabilityController } from './availability.controller';
import { Availability } from './entities/availability.entity';
import { AvailabilityService } from './availability.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Availability]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
})
export class AvailabilityModule {}
