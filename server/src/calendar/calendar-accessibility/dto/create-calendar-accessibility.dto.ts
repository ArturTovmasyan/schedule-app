import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { AccessibilityTypeEnum } from '../enums/calendar-accessibility.enum';

export class CreateCalendarAccessibilityDto {
  @ApiProperty({ required: true, enum: AccessibilityTypeEnum })
  @IsNotEmpty()
  @IsEnum(AccessibilityTypeEnum)
  accessibilityType: AccessibilityTypeEnum;

  @ApiProperty({ required: false, isArray: true, type: 'string' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  domains?: string[];
}
