import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RevokeCalendarDto {
  @ApiProperty({ required: true, type: 'string' })
  @IsString()
  @IsNotEmpty()
  calendarId: string;
}

export default RevokeCalendarDto;
