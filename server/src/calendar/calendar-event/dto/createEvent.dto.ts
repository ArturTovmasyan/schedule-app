import {
  ArrayNotEmpty,
  IsDateString,
  IsNotEmpty,
  IsString,
  IsEnum,
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
  @IsNotEmpty()
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
}

export default CreateEventDto;
