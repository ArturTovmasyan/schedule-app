import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { NotificationTypeEnum } from '../enums/notifications.enum';

export class CreateNotificationDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsUUID(4)
  receiverUserId: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsEnum(NotificationTypeEnum)
  type: NotificationTypeEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID(4)
  accessRequestId?: string;
}
