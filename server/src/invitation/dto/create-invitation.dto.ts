import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsString,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({ required: true, isArray: true, type: 'string' })
  @IsNotEmpty()
  @IsArray()
  @IsEmail({}, { each: true })
  emails: string[];

  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ required: false, type: 'boolean' })
  @IsOptional()
  @IsBoolean()
  shareMyCalendar?: Boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  requestCalendarView?: Boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  endDate: Date;
}
