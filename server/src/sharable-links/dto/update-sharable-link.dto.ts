import { PartialType } from '@nestjs/swagger';
import { CreateSharableLinkDto } from './create-sharable-link.dto';

export class UpdateSharableLinkDto extends PartialType(CreateSharableLinkDto) {}
