import { IsEmail, IsString, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCalendarAccessDto {
  @ApiProperty({ required: true })
  @IsEmail({}, { each: true })
  toEmails: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  timeForAccess?: Date;

  @ApiProperty({ required: false, type: 'string', maxLength: 2500 })
  @IsOptional()
  @IsString()
  @MaxLength(2500)
  comment?: string;
}
