import { UserDto } from '@user/dto/user.dto';

export interface LoginStatus {
  user: UserDto;
  accessToken: any;
  expiresIn: any;
}
