import { Expose } from 'class-transformer';
import {IsNotEmpty, IsString, Matches} from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @Expose({ name: 'first_name' })
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @Matches(
      /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*\d))|((?=.*[A-Z])(?=.*\d)))(?=.{6,})/,
      { message: 'Invalid password' },
  )
  password: string;

  @IsString()
  @IsNotEmpty()
  readonly token: string;
}
