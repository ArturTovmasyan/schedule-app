import { UserDto } from 'src/users/dto/user.dto';
import { User } from '@user/user.entity';

export const toUserDto = (user: User): UserDto => {
  const { password, ...userDto } = user;
  return userDto;
};
