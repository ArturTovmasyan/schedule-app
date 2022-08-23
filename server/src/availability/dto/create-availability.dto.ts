import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ClockType } from '../enums/clockType.enum';

export class CreateAvailabilityDto {
  @IsNotEmpty()
  from: string;

  @IsNotEmpty()
  to: string;

  @IsNotEmpty()
  @IsEnum(ClockType)
  clockType: ClockType;

  @IsOptional()
  sunday?: boolean;

  @IsOptional()
  monday?: boolean;

  @IsOptional()
  tuesday?: boolean;

  @IsOptional()
  wednesday?: boolean;

  @IsOptional()
  thursday?: boolean;

  @IsOptional()
  friday?: boolean;

  @IsOptional()
  saturday?: boolean;
}
