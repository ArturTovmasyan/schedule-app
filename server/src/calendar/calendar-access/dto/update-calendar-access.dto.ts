import { PartialType } from '@nestjs/mapped-types';
import { CreateCalendarAccessDto } from './create-calendar-access.dto';

export class UpdateCalendarAccessDto extends PartialType(CreateCalendarAccessDto) {}
