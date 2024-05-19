import { Module } from '@nestjs/common';
import { ClientsCredentialsService } from './clients-credentials.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarToken } from '../calendar-permissions/entity/calendarToken.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([CalendarToken]), ConfigModule],
  providers: [ClientsCredentialsService],
  exports: [ClientsCredentialsService],
})
export class ClientsCredentialsModule {}
