import { UserDto } from '@user/dto/user.dto';
import { User } from '@user/entity/user.entity';
import { UserUpdateDto } from '@user/dto/user-update.dto';

export const toUserDto = (user: User): UserDto => {
  const { password, ...userDto } = user;
  return userDto;
};

export const toUserInfoDto = (user: User): UserUpdateDto => {
  const {
    password,
    status,
    createdOn,
    updatedOn,
    deletedOn,
    ...userUpdateDto
  } = user;
  return userUpdateDto;
};
