import {
  ArrayNotEmpty,
  IsDateString,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsArray,
  IsUUID,
  IsOptional,
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

  @IsEnum(CalendarTypeEnum, { each: true })
  @ArrayNotEmpty()
  syncWith: CalendarTypeEnum[];

  @IsArray()
  @IsUUID(4, { each: true })
  attendees?: string[];

  @IsArray()
  @IsUUID(4, { each: true })
  optionalAttendees?: string[];
}

export default CreateEventDto;
