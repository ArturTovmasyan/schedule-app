import { createParamDecorator } from '@nestjs/common';
import {User} from "@user/entity/user.entity";

export const GetUser = createParamDecorator(
    (req, data): User => req.user,
);
