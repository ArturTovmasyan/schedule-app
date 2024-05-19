import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { toUserDto } from 'src/shared/mapper';
import { UserCreateDto } from './dto/user-create.dto';
import { UserDto } from './dto/user.dto';
import { User } from '@user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserUpdateDto } from './dto/user-update.dto';
import { comparePasswords } from '@shared/utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

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
      throw new NotFoundException();
    }
    return toUserDto(user);
  }

  async findOneByEmail(email: string): Promise<UserDto> {
    const user = await this.userRepo.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      throw new NotFoundException();
    }
    return toUserDto(user);
  }

  async findOne(options?: object): Promise<UserDto> {
    const user = await this.userRepo.findOne(options);
    if (!user) {
      throw new NotFoundException();
    }
    return toUserDto(user);
  }

  async findByLogin({ email, password }): Promise<UserDto> {
    const user = await this.userRepo.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      throw new NotFoundException();
    }
    if (!(await comparePasswords(user.password, password))) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return toUserDto(user);
  }

  async findByPayload({ email }: any): Promise<UserDto> {
    return await this.findOne({
      where: { email },
    });
  }

  async create(userDto: UserCreateDto): Promise<UserDto> {
    const { email, firstName, lastName, password } = userDto;
    const userInDb = await this.userRepo.findOne({
      where: { email },
    });
    if (userInDb) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
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

  async update(id: string, userDto: UserUpdateDto): Promise<UserDto> {
    const { firstName, lastName, email } = userDto;

    let user: User = await this.userRepo.findOne({
      where: {
        id,
      },
    });
    if (!user) {
      throw new NotFoundException();
    }

    user = {
      id,
      firstName,
      lastName,
      email,
      password: user.password,
    };

    await this.userRepo.update({ id }, user);

    user = await this.userRepo.findOne({ where: { id } });
    return toUserDto(user);
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
}
