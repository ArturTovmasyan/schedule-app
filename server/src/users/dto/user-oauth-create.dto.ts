import { Expose } from 'class-transformer';
import {IsNotEmpty, IsNumber, IsString} from 'class-validator';

export class OauthUserDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @Expose({ name: 'first_name' })
  @IsNotEmpty()
  firstName: string;

  @Expose({ name: 'last_name' })
  @IsNotEmpty()
  lastName: string;

  @Expose({ name: 'status' })
  @IsNumber()
  status: number = 1;

  @Expose({ name: 'oauth_id' })
  @IsNumber()
  @IsNotEmpty()
  oauthId: number;

  @Expose({ name: 'provider' })
  @IsString()
  @IsNotEmpty()
  provider: string;
}
