import {IsBoolean, IsEmail, IsNotEmpty} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  password: string;
  @IsBoolean()
  remember: boolean;
}
