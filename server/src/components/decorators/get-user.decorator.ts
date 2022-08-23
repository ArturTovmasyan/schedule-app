import { createParamDecorator } from '@nestjs/common';
import { User } from '@user/entity/user.entity';

export const GetUser = createParamDecorator((data: unknown, ctx): User => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
