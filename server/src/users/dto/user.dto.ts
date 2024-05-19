import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @Expose({ name: 'first_name' })
  firstName: string;

  @Expose({ name: 'last_name' })
  lastName: string;

  @Expose({ name: 'status' })
  status?: number;

  @Expose({ name: 'created_on' })
  createdOn?: Date;

  @Expose({ name: 'updated_on' })
  updatedOn?: Date;

  @Expose({ name: 'deleted_on' })
  deletedOn?: Date;
}
