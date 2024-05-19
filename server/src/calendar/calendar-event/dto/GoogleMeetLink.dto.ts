import {
  IsDateString,
  IsNotEmpty,
  IsString,
  IsArray,
  IsEmail,
} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class GoogleMeetLinkDto {
  @ApiProperty({ required: true, type: 'string' })
  @IsString()
  @IsDateString()
  @IsNotEmpty()
  start: string;

  @ApiProperty({ required: true, type: 'string' })
  @IsString()
  @IsDateString()
  @IsNotEmpty()
  end: string;

  @ApiProperty({ required: true, type: 'string' })
  @IsString()
  calendarId: string;

  @ApiProperty({ required: true, type: 'array' })
  @IsArray()
  @IsEmail({}, { each: true })
  @IsNotEmpty()
  attendees?: string[];
}

export default GoogleMeetLinkDto;
