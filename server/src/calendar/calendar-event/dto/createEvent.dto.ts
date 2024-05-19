import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsString,
  IsArray,
  IsEmail,
  IsOptional,
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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;
}

export default CreateEventDto;
