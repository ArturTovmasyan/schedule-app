import {
  IsDateString,
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsEmail,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsString()
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
  @IsNotEmpty()
  attendees?: string[];

  @IsArray()
  @IsEmail({}, { each: true })
  optionalAttendees?: string[];
}

export default CreateEventDto;
