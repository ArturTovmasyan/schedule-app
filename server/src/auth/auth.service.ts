import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { UsersService } from '@user/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserCreateDto } from '@user/dto/user-create.dto';
import { RegistrationStatus } from 'src/auth/interfaces/regisitration-status.interface';
import { JwtPayload } from 'src/auth/interfaces/payload.interface';
import { UserDto } from '@user/dto/user.dto';
import { LoginStatus } from './interfaces/login-status.interface';
import {SignInDto} from "./dto/signin.dto";
import {ConfigService} from "@nestjs/config";
import {MailService} from "../mail/mail.service";
import {ErrorMessages} from "@shared/error.messages";
import {statusEnum} from "@user/enums/status.enum";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "@user/entity/user.entity";
import {Repository} from "typeorm";
import {ChangePasswordDto} from "./dto/change-password.dto";

@Injectable()
export class AuthService {

  private readonly appHost:string = process.env.WEB_HOST;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async register(userDto: UserCreateDto): Promise<RegistrationStatus> {
    debugger;
    let status: RegistrationStatus = {
      success: true,
      message: 'user registered',
    };

    try {
      const user = await this.usersService.create(userDto);
      await this.sendConfirmation(user);
    } catch (error) {
      debugger;
      status = {
        success: false,
        message: error,
      };
    }

    return status;
  }

  async login(dto: SignInDto): Promise<LoginStatus> {
    debugger;
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
    debugger;
    const user: JwtPayload = { id, email };
    const accessToken = this.jwtService.sign(user);
    return {
      expiresIn: process.env.JWT_EXPIRES_IN,
      accessToken,
    };
  }

  public async verifyToken(token): Promise<UserDto> {
    const data = this.jwtService.verify(token) as JwtPayload;
    const user = await this.userRepo.findOne({where: { id: data.id }});

    if (user) {
      return user;
    }

    throw new UnauthorizedException({
          status: HttpStatus.UNAUTHORIZED,
          message: ErrorMessages.userNotFound,
        }
    );
  }

  async sendConfirmation(user: UserDto) {
    debugger;
    const token = await this._createToken(user);
    const confirmLink = `${this.appHost}confirm?token=${token.accessToken}`;

    await this.mailService.send({
      // from: process.env.NO_REPLY_EMAIL,
      from: 'no-reply@handshake.com',
      to: user.email,
      subject: 'Verify Handshake Account',
      html: `
                <h3>Hello ${user.firstName}!</h3>
                <p>Please use this <a href="${confirmLink}">link</a> to confirm your account.</p>
            `,
    });
  }

  async resetPassword(email: string) {
    debugger;
    const user: UserDto = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: ErrorMessages.userNotFound,
      });
    }

    const token = await this._createToken(user);
    const changeLink = `${this.appHost}change-password?token=${token.accessToken}`;

    //TODO must be fetch from config .env
    await this.mailService.send({
      // from: process.env.NO_REPLY_EMAIL,
      from: 'no-reply@handshake.com',
      to: user.email,
      subject: 'Reset Handshake Account Password',
      html: `
                <h3>Hello ${user.firstName}!</h3>
                <p>Please use this <a href="${changeLink}">link</a> to reset your password.</p>
            `,
    });
  }

  async confirmRegistration(token: string): Promise<boolean> {
    const user:Pick<UserDto, 'id'|'status'> = await this.verifyToken(token);

    if (user && user.status === statusEnum.pending) {
      user.status = statusEnum.active;
      const data = await this.userRepo.update(user.id, user);
      return data.affected > 0;
    }

    throw new BadRequestException({
      status: HttpStatus.BAD_REQUEST,
      message: ErrorMessages.confirmError,
    });
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<boolean> {
    const password = await this.usersService.hashPassword(changePasswordDto.password);
    await this.userRepo.update(userId , {password});
    return true;
  }
}
