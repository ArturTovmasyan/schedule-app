import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Patch,
  Post, Query,
  Req,
  UseGuards, ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserCreateDto } from '@user/dto/user-create.dto';
import { AuthService } from './auth.service';
import { LoginStatus } from './interfaces/login-status.interface';
import { JwtPayload } from './interfaces/payload.interface';
import { RegistrationStatus } from './interfaces/regisitration-status.interface';
import { UserDto } from '@user/dto/user.dto';
import {SignInDto} from "./dto/signin.dto";
import {ConfirmAccountDto} from "./dto/confirm-account.dto";
import {ChangePasswordDto} from "./dto/change-password.dto";

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
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
  public async resetPassword(@Body() dto: UserDto): Promise<void> {
   await this.authService.resetPassword(dto.email);
  }

  @Patch('change-password')
  @UseGuards(AuthGuard())
  public async changePassword(
      // @GetUser() user: User,
      @Body(new ValidationPipe()) changePasswordDto: ChangePasswordDto): Promise<boolean> {
    debugger;
    let user: UserDto = await this.authService.verifyToken(changePasswordDto.token);
    return await this.authService.changePassword(user.id, changePasswordDto);
  }

  @Get('confirm')
  async confirm(@Query(new ValidationPipe()) query: ConfirmAccountDto): Promise<boolean> {
    return await this.authService.confirmRegistration(query.token);
  }
}
