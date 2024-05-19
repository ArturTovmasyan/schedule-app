import {
  IsUUID,
  IsEnum,
  IsArray,
  IsString,
  IsNotEmpty,
  ArrayNotEmpty,
  ValidateNested,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  IPaginate,
  ISharableLinkSlot,
} from '../interfaces/sharable-links.interface';
import { MeetViaEnum } from '../enums/sharable-links.enum';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ required: true })
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => SharableLinkSlot)
  @ArrayNotEmpty()
  slots: SharableLinkSlot[];
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
}
class SharableLinkSlot implements ISharableLinkSlot {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  endDate: Date;
}
