import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '@user/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserCreateDto } from '@user/dto/user-create.dto';
import { RegistrationStatus } from 'src/auth/interfaces/regisitration-status.interface';
import { UserLoginDto } from '@user/dto/user-login.dto';
import { JwtPayload } from 'src/auth/interfaces/payload.interface';
import { UserDto } from '@user/dto/user.dto';
import { LoginStatus } from './interfaces/login-status.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(userDto: UserCreateDto): Promise<RegistrationStatus> {
    let status: RegistrationStatus = {
      success: true,
      message: 'user registered',
    };
    try {
      await this.usersService.create(userDto);
    } catch (error) {
      status = {
        success: false,
        message: error,
      };
    }
    return status;
  }

  async login(dto: UserLoginDto): Promise<LoginStatus> {
    const user = await this.usersService.findByLogin(dto);
    const token = this._createToken(user);
    return {
      user,
      ...token,
    };
  }

  async validateUser(payload: JwtPayload): Promise<UserDto> {
    const user = await this.usersService.findByPayload(payload);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  private _createToken({ id, email }: UserDto): any {
    const user: JwtPayload = { id, email };
    const accessToken = this.jwtService.sign(user);
    return {
      expiresIn: process.env.JWT_EXPIRES_IN,
      accessToken,
    };
  }
}
