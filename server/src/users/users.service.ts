import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {toUserDto, toUserInfoDto} from 'src/shared/mapper';
import { UserCreateDto } from './dto/user-create.dto';
import { UserDto } from './dto/user.dto';
import { User } from '@user/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserUpdateDto } from './dto/user-update.dto';
import {comparePasswords, generatePassword} from '@shared/utils';
import { ErrorMessages } from '@shared/error.messages';
import {OauthUserDto} from "@user/dto/user-oauth-create.dto";
import {OauthProvider} from "../auth/enums/oauth.provider.enum";
import {StatusEnum} from "@user/enums/status.enum";

@Injectable()
export class UsersService {

  public readonly saltRounds = 10;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(userDto: UserCreateDto): Promise<UserDto> {
    const { email, firstName, lastName, password } = userDto;
    const userInDb = await this.userRepo.findOne({
      where: { email }, withDeleted: true
    });

    if (userInDb) {
      //TODO will be move to ExceptionFilter or Interceptor for global usage
      throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            message: ErrorMessages.userExist,
          },
          HttpStatus.FORBIDDEN,
      );
    }

    const user: User = await this.userRepo.create({
      email,
      firstName,
      lastName,
      password,
    });

    await this.userRepo.save(user);
    return toUserDto(user);
  }

  async registerOAuthUser(userDto: any, provider: OauthProvider): Promise<OauthUserDto> {
    const oauthData = userDto;
    const user = new User();
    user.email = oauthData.email;
    user.oauthId = oauthData.sub;
    user.firstName = oauthData.given_name;
    user.lastName = oauthData.family_name;
    user.provider = provider;
    user.password = generatePassword(10);
    user.status = 1;

    await this.userRepo.save(user);
    return user;
  }

  //TODO change for oauthId and provider
  async update(id: string, userDto: UserUpdateDto): Promise<UserDto> {

    const { firstName, lastName, email } = userDto;

    let user: User = await this.userRepo.findOne({ where: {id} });

    if (!user) {
      throw new NotFoundException();
    }

    user = {
      id,
      firstName,
      lastName,
      email,
      status: 0,
      password: user.password,
      oauthId: 0,
      provider: ""
    };

    await this.userRepo.update({ id }, user);
    return user;
  }

  async delete(id: string): Promise<UserDto> {
    let user: User = await this.userRepo.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException();
    }

    await this.userRepo.softDelete({ id });

    user = await this.userRepo.findOne({ where: { id }, withDeleted: true });
    return toUserDto(user);
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return await bcrypt.hash(password, salt);
  }

  async findAll(): Promise<UserDto[]> {
    const users = await this.userRepo.find();
    return users.map((user) => toUserDto(user));
  }

  async findOneById(id: string): Promise<UserDto> {
    const user = await this.userRepo.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: ErrorMessages.userNotFound,
      });
    }

    return toUserDto(user);
  }

  async findOneByEmail(email): Promise<UserDto> {
    const user = await this.userRepo.findOne({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: ErrorMessages.userNotFound,
      });
    }
    return toUserDto(user);
  }

  async findByLogin({ email, password }): Promise<UserUpdateDto> {
    const user = await this.userRepo.findOne({
      where: {
        email: email,
        status: StatusEnum.active,
        oauthId: 0,
      },
    });

    if (!user) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: ErrorMessages.userNotFound,
      });
    }

    if (!(await comparePasswords(user.password, password))) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    return toUserInfoDto(user);
  }
}
