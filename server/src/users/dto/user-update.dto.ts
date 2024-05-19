import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserUpdateDto {
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @Expose({ name: 'first_name' })
  firstName: string;

  @Expose({ name: 'last_name' })
  lastName: string;
}
