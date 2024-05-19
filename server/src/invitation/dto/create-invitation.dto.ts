import {
  IsArray,
  IsEmail,
  IsString,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  shareMyCalendar?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  requestCalendarView?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  endDate: Date;
}
