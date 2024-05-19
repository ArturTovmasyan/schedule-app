import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Post, Query, Redirect,
  Req,
  UseGuards, ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserCreateDto } from '@user/dto/user-create.dto';
import { AuthService } from './auth.service';
import { LoginStatus } from './interfaces/login-status.interface';
import { JwtPayload } from './interfaces/payload.interface';
import { RegistrationStatus } from './interfaces/regisitration-status.interface';
import { UsersService } from '@user/users.service';
import { UserDto } from '@user/dto/user.dto';
import { ErrorMessages } from '@shared/error.messages';
import {SignInDto} from "./dto/signin.dto";
import {ConfirmAccountDto} from "./dto/confirm-account.dto";

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Post('register')
  public async register(
    @Body() dto: UserCreateDto,
  ): Promise<RegistrationStatus> {
    const result: RegistrationStatus = await this.authService.register(dto);
    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }
    return result;
  }

  @Post('login')
  public async login(@Body() dto: SignInDto): Promise<LoginStatus> {
    return await this.authService.login(dto);
  }

  @Get('whoami')
  @UseGuards(AuthGuard())
  public async testAuth(@Req() req: any): Promise<JwtPayload> {
    return req.user;
  }

  @Post('reset-password')
  public async resetPassword(@Body() dto: UserDto): Promise<UserDto> {
    const user: UserDto = await this.userService.findOneByEmail(dto.email);
    if (!user) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: ErrorMessages.userNotFound,
      });
    }

    return user;
  }

  @Get('/confirm')
  async confirm(@Query(new ValidationPipe()) query: ConfirmAccountDto): Promise<boolean> {
    return await this.authService.confirm(query.token);
  }
}
