import { PartialType } from '@nestjs/mapped-types';
import { CreateAccessRequestDto } from './create-access-request.dto';

export class UpdateAccessRequestDto extends PartialType(CreateAccessRequestDto) {}
