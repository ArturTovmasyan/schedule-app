import { ApiProperty } from '@nestjs/swagger';

export class CreateAvailabilityDto {
  @ApiProperty({ required: true, type: 'string' })
  @IsNotEmpty()
  from: string;

  @ApiProperty({ required: true, type: 'string' })
  @IsNotEmpty()
  to: string;

  @ApiProperty({ required: true, enum: ClockType })
  @IsNotEmpty()
  @IsEnum(ClockType)
  clockType: ClockType;

  @ApiProperty({ required: false, type: 'boolean' })
  @IsOptional()
  sunday?: boolean;

  @ApiProperty({ required: false, type: 'boolean' })
  @IsOptional()
  monday?: boolean;

  @ApiProperty({ required: false, type: 'boolean' })
  @IsOptional()
  tuesday?: boolean;

  @ApiProperty({ required: false, type: 'boolean' })
  @IsOptional()
  wednesday?: boolean;

  @ApiProperty({ required: false, type: 'boolean' })
  @IsOptional()
  thursday?: boolean;

  @ApiProperty({ required: false, type: 'boolean' })
  @IsOptional()
  friday?: boolean;

  @ApiProperty({ required: false, type: 'boolean' })
  @IsOptional()
  saturday?: boolean;

  @ApiProperty({ required: true, type: 'number'})
  @IsNotEmpty()
  timezoneOffset: number;

}
