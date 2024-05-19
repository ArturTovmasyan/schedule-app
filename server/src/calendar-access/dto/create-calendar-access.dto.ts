import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsEmail,
  IsString,
  MaxLength,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { TimeForAccessEnum } from '../enums/access-time.enum';

export class CreateCalendarAccessDto {
  @ApiProperty({ required: true, type: 'string' })
  @IsNotEmpty()
  @IsEmail()
  toEmail: string;

  @ApiProperty({ required: false, enum: TimeForAccessEnum })
  @IsOptional()
  @IsEnum(TimeForAccessEnum)
  timeForAccess?: TimeForAccessEnum;

  @ApiProperty({ required: false, type: 'string', maxLength: 2500 })
  @IsOptional()
  @IsString()
  @MaxLength(2500)
  comment?: string;
}
