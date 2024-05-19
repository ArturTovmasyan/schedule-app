import {
  IsEnum,
  IsEmail,
  IsString,
  MaxLength,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

import { TimeForAccessEnum } from 'src/calendar-access/enums/access-time.enum';
import {
  RequestRedeemEnum,
  RequestStatusEnum,
} from '../enums/requestStatus.enum';

export class CreateAccessRequestDto {
  @IsNotEmpty()
  @IsEmail()
  toEmail: string;

  @IsOptional()
  @IsEnum(TimeForAccessEnum)
  timeForAccess?: TimeForAccessEnum;

  @IsOptional()
  @IsString()
  @MaxLength(2500)
  comment?: string;
}

export class AccessRequestQueryParams {
  @IsOptional()
  @IsEnum(RequestStatusEnum)
  status?: RequestStatusEnum;
}

export class RedeemAccessRequest {
  @IsNotEmpty()
  @IsEnum(RequestRedeemEnum)
  status: RequestRedeemEnum;
}
