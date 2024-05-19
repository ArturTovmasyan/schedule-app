import {
  IsUUID,
  IsEnum,
  IsArray,
  IsString,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { SharableLinkSlot } from './create-sharable-link.dto';
import { MeetViaEnum } from '../enums/sharable-links.enum';

export class UpdateSharableLinkDto {
  @ApiProperty({ required: false, description: 'For adding new slots' })
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  @Type(() => SharableLinkSlot)
  addSlots?: SharableLinkSlot[];

  @ApiProperty({ required: false, description: 'For id of deletable slots' })
  @IsUUID(4, { each: true })
  @IsOptional()
  @IsArray()
  deleteSlots?: string[];

  @ApiProperty({ required: true })
  @IsArray()
  @IsUUID(4, { each: true })
  attendees: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: true, enum: MeetViaEnum })
  @IsOptional()
  @IsEnum(MeetViaEnum)
  meetVia?: MeetViaEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;
}
