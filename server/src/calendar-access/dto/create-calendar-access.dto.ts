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
  @IsNotEmpty()
  @IsEmail()
  toEmail: string;

  @IsOptional()
  @IsEnum(TimeForAccessEnum)
  timeForAccess?: TimeForAccessEnum;

  @IsOptional()
  @IsString()
  @MaxLength(2500)
  comment?: string;
}
