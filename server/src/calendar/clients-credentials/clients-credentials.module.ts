import { Module } from '@nestjs/common';
import { ClientsCredentialsService } from './clients-credentials.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarToken } from '../calendar-permissions/entity/calendarToken.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CalendarToken])],
  providers: [ClientsCredentialsService],
  exports: [ClientsCredentialsService],
})
export class ClientsCredentialsModule {}
