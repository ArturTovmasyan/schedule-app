import { Expose } from 'class-transformer';
import {IsNotEmpty, IsNumber, IsString, Matches, MaxLength, MinLength} from 'class-validator';

export class UserCreateDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @Expose({ name: 'first_name' })
  firstName: string;

  @Expose({ name: 'last_name' })
  lastName: string;

  @IsNotEmpty()
  @IsString()
  @Matches(
      /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/,
      { message: 'Invalid password' },
  )
  password: string;

  @Expose({ name: 'status' })
  @IsNumber()
  status: number = 0;
}
