import {
  IsUUID,
  IsEnum,
  IsArray,
  IsNumber,
  IsString,
  IsOptional,
  IsNotEmpty,
  ArrayNotEmpty,
  ValidateNested,
  IsEmail,
  IsBoolean,
  IsBooleanString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import {
  IPaginate,
  ISharableLinkSlot,
} from '../interfaces/sharable-links.interface';
import { FindLinkByEnum, MeetViaEnum } from '../enums/sharable-links.enum';

export class CreateSharableLinkDto {
  @ApiProperty({ required: false })
  @IsArray()
  @IsUUID(4, { each: true })
  attendees?: string[];

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ required: true, enum: MeetViaEnum })
  @IsNotEmpty()
  @IsEnum(MeetViaEnum)
  meetVia: MeetViaEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: true })
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => SharableLinkSlot)
  @ArrayNotEmpty()
  slots: SharableLinkSlot[];
}

export class SelectSlotPublic {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class CancelMeetingDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  reason: string;
}

export class RescheduleMeetingDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsUUID()
  newSlotId: string;
}

export class PaginationDto implements IPaginate {
  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @IsNumber()
  limit: number = 20;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  offset: number = 0;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBooleanString()
  inAttendees?: string;
}
export class SharableLinkSlot implements ISharableLinkSlot {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  endDate: Date;
}
