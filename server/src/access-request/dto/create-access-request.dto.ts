import {
  IsEnum,
  IsEmail,
  IsString,
  MaxLength,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { TimeForAccessEnum } from 'src/calendar-access/enums/access-time.enum';
import {
  AccessRequestStatusEnum,
  RequestStatusEnum,
} from '../enums/requestStatus.enum';

export class CreateAccessRequestDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsEmail()
  toEmail: string;

  @ApiProperty({ required: false, enum: TimeForAccessEnum })
  @IsOptional()
  @IsEnum(TimeForAccessEnum)
  timeForAccess?: TimeForAccessEnum;

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
