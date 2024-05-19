import {
  IsDateString,
  IsNotEmpty,
  IsString,
  IsArray,
  IsEmail,
  ValidateIf,
  MinLength,
  IsNumberString,
} from 'class-validator';
import { MeetViaEnum } from 'src/sharable-links/enums/sharable-links.enum';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @IsEmail({}, { each: true })
  attendees?: string[] = [];

  @IsArray()
  @IsEmail({}, { each: true })
  optionalAttendees?: string[];

  @IsString()
  @IsDateString()
  @IsNotEmpty()
  start: string;

  @IsString()
  @IsDateString()
  @IsNotEmpty()
  end: string;

  @IsString()
  calendarId: string;

  @IsString()
  entanglesLocation: MeetViaEnum;

  @ValidateIf((o) => o.entanglesLocation == MeetViaEnum.InboundCall)
  @MinLength(5)
  @IsNumberString()
  phoneNumber?: string;

  @ValidateIf((o) => o.entanglesLocation == MeetViaEnum.PhysicalAddress)
  @MinLength(5)
  @IsString()
  address?: string;
}

export default CreateEventDto;
