import { PartialType } from '@nestjs/mapped-types';
import { CreateCalendarAccessibilityDto } from './create-calendar-accessibility.dto';

export class UpdateCalendarAccessibilityDto extends PartialType(CreateCalendarAccessibilityDto) {}
