import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {IsNotEmpty, IsNumber, IsString} from 'class-validator';

export class OauthUserDto {
  @ApiProperty({ required: true, type: 'string' })
  @IsNotEmpty()
  id: string;

  @ApiProperty({ required: true, type: 'string' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ required: true, type: 'string' })
  @Expose({ name: 'first_name' })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ required: true, type: 'string' })
  @Expose({ name: 'last_name' })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ required: false, type: 'number' })
  @Expose({ name: 'status' })
  @IsNumber()
  status: number = 1;

  @ApiProperty({ required: true, type: 'number' })
  @Expose({ name: 'oauth_id' })
  @IsNumber()
  @IsNotEmpty()
  oauthId: number;

  @ApiProperty({ required: true, type: 'string' })
  @Expose({ name: 'provider' })
  @IsString()
  @IsNotEmpty()
  provider: string;
}
