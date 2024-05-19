import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserDto {
  @ApiProperty({ required: true, type: 'string' })
  @IsNotEmpty()
  id: string;

  @ApiProperty({ required: true, type: 'string' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ required: false, type: 'string' })
  @Expose({ name: 'first_name' })
  firstName: string;

  @ApiProperty({ required: false, type: 'string' })
  @Expose({ name: 'last_name' })
  lastName: string;

  @ApiProperty({ required: false, type: 'number' })
  @Expose({ name: 'status' })
  status: number;

  @ApiProperty({ required: false, type: 'date' })
  @Expose({ name: 'created_on' })
  createdOn?: Date;

  @ApiProperty({ required: false, type: 'date' })
  @Expose({ name: 'updated_on' })
  updatedOn?: Date;

  @ApiProperty({ required: false, type: 'date' })
  @Expose({ name: 'deleted_on' })
  deletedOn?: Date;

  @Expose({ name: 'stripe_customer_id' })
  @IsString()
  stripeCustomerId?: string;
}
