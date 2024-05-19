import {PartialType} from "@nestjs/mapped-types";
import {UserCreateDto} from "@user/dto/user-create.dto";

export class UserUpdateDto extends PartialType(UserCreateDto) {}
