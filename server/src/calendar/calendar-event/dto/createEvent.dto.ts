import {
  ArrayNotEmpty,
  IsDateString,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsArray,
  IsUUID,
  IsOptional,
  IsEmail,
} from 'class-validator';
import { CalendarTypeEnum } from 'src/calendar/calendar-permissions/enums/calendarType.enum';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  meetLink: string;

  @IsString()
  @IsDateString()
  @IsNotEmpty()
  start: string;

  @IsString()
  @IsDateString()
  @IsNotEmpty()
  end: string;

  @IsString()
  syncWith: string;

  @IsArray()
  @IsEmail({}, { each: true })
  attendees?: string[];

  @IsArray()
  @IsEmail({}, { each: true })
  optionalAttendees?: string[];
}

export default CreateEventDto;
