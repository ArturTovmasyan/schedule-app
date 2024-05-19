import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserCreateDto } from '@user/dto/user-create.dto';
import { UserLoginDto } from '@user/dto/user-login.dto';
import { AuthService } from './auth.service';
import { LoginStatus } from './interfaces/login-status.interface';
import { JwtPayload } from './interfaces/payload.interface';
import { RegistrationStatus } from './interfaces/regisitration-status.interface';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  public async login(@Body() dto: UserLoginDto): Promise<LoginStatus> {
    return await this.authService.login(dto);
  }

  @Get('whoami')
  @UseGuards(AuthGuard())
  public async testAuth(@Req() req: any): Promise<JwtPayload> {
    return req.user;
  }
}
