import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import {
  AccessRequestStatusEnum,
  RequestStatusEnum,
} from '../enums/requestStatus.enum';

export class CreateAccessRequestDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsEmail()
  toEmail: string;

  @ApiProperty({ required: false })
  @IsOptional()
  timeForAccess?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2500)
  comment?: string;
}

export class AccessRequestQueryParams {
  @ApiProperty({ required: false, enum: RequestStatusEnum })
  @IsOptional()
  @IsEnum(RequestStatusEnum)
  status?: RequestStatusEnum;
}

export class AccessRequestStatus {
  @ApiProperty({ required: true, enum: RequestStatusEnum })
  @IsNotEmpty()
  @IsEnum(AccessRequestStatusEnum)
  status: AccessRequestStatusEnum;
}
