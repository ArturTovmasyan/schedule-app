import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserUpdateDto {
  @ApiProperty({ required: false, type: 'string' })
  @IsString()
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

  @Expose({ name: 'stripe_customer_id' })
  @IsString()
  stripeCustomerId?: string;
}
