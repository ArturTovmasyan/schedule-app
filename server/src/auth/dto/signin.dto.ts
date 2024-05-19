import {IsBoolean, IsEmail, IsNotEmpty} from 'class-validator';

export class SignInDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  password: string;
  @IsBoolean()
  remember: boolean;
}
