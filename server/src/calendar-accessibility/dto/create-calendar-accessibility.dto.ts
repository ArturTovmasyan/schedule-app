import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { AccessibilityTypeEnum } from '../enums/calendar-accessibility.enum';

export class CreateCalendarAccessibilityDto {
  @IsNotEmpty()
  @IsEnum(AccessibilityTypeEnum)
  accessibilityType: AccessibilityTypeEnum;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  domains?: string[];
}
