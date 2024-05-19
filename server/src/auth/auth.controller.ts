import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus, NotFoundException,
    Patch,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {UserCreateDto} from '@user/dto/user-create.dto';
import {AuthService} from './auth.service';
import {LoginStatus} from './interfaces/login-status.interface';
import {RegistrationStatus} from './interfaces/regisitration-status.interface';
import {UserDto} from '@user/dto/user.dto';
import {SignInDto} from "./dto/signin.dto";
import {ConfirmAccountDto} from "./dto/confirm-account.dto";
import {ChangePasswordDto} from "./dto/change-password.dto";
import {ConfigService} from "@nestjs/config";
import {ErrorMessages} from "@shared/error.messages";
import {OauthProvider} from "./enums/oauth.provider.enum";

@ApiBearerAuth()
@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Register user' })
  @Post('register')
  public async register(
    @Body() dto: UserCreateDto,
    @Query('invitationId') invitationId: string,
  ): Promise<RegistrationStatus> {
    const result: RegistrationStatus = await this.authService.register(dto, invitationId);
    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }
    return result;
  }

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Login user' })
  @Post('login')
  public async login(@Body() dto: SignInDto): Promise<LoginStatus> {
    return await this.authService.login(dto);
  }

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Reset Password' })
  @Post('reset-password')
  public async resetPassword(@Body() dto: UserDto): Promise<void> {
    await this.authService.resetPassword(dto.email);
  }

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Change password' })
  @Patch('change-password')
  @UseGuards(AuthGuard())
  public async changePassword(
    @Body(new ValidationPipe()) changePasswordDto: ChangePasswordDto,
  ): Promise<boolean> {
    const user: UserDto = await this.authService.verifyToken(
      changePasswordDto.token,
    );
    return await this.authService.changePassword(user.id, changePasswordDto);
  }

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Confirm validation' })
  @Get('confirm')
  async confirm(
    @Query(new ValidationPipe()) query: ConfirmAccountDto,
  ): Promise<boolean> {
    return await this.authService.confirmRegistration(query.token);
  }

  @ApiExcludeEndpoint()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @ApiExcludeEndpoint()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() req, @Res() res) {
    const user: any = req.user._json;
    const jwt = await this.authService.validateGoogleLogin(user);
    const webHost = this.configService.get<string>('WEB_HOST');

    if (isString(jwt)) {
      res.redirect(webHost + 'oauth/success?token=' + jwt);
    } else {
      res.redirect(webHost + 'login');
    }
  }

  @ApiExcludeEndpoint()
  @Post('microsoft/callback')
  async msLoginCallback(@Req() req, @Res() res): Promise<any> {
    const user: any = req.body;

    if (user && user.id) {
      const jwt = await this.authService.validateMicrosoftLogin(user);
      if (jwt) {
        return { accessToken: jwt };
      }
    }

    @Post('register')
    public async register(@Body() dto: UserCreateDto): Promise<RegistrationStatus> {
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

    @Post('reset-password')
    public async resetPassword(@Body() dto: UserDto): Promise<void> {
        await this.authService.resetPassword(dto.email);
    }

    @Patch('change-password')
    @UseGuards(AuthGuard())
    public async changePassword(@Body(new ValidationPipe()) changePasswordDto: ChangePasswordDto): Promise<boolean> {
        let user: UserDto = await this.authService.verifyToken(changePasswordDto.token);
        return await this.authService.changePassword(user.id, changePasswordDto);
    }

    @Get('confirm')
    async confirm(@Query(new ValidationPipe()) query: ConfirmAccountDto): Promise<boolean> {
        return await this.authService.confirmRegistration(query.token);
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    googleLogin() {}

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleLoginCallback(@Req() req, @Res() res) {
        const user: any = req.user._json;
        const userData = await this.authService.validateGoogleLogin(user);
        const webHost = this.configService.get<string>('WEB_HOST');

        if (userData) {
            res.redirect(webHost + 'oauth/success?token=' + userData.accessToken + '&customerId='+userData.stripeCustomerId);
        } else {
            res.redirect(webHost+'404');
        }
    }

    @Post('microsoft/callback')
    // @UseGuards(AuthGuard('oauth-bearer'))
    async msLoginCallback(@Req() req, @Res() res) {
        const user: any = req.body;

        debugger;
        if (user && user.id) {
            debugger;
            const userData = await this.authService.validateMicrosoftLogin(user);
            if (userData) {
                return res.status(200).json({
                    accessToken: userData.accessToken,
                    stripeCustomerId: userData.stripeCustomerId,
                    provider: OauthProvider.MICROSOFT
                });
            }
        }

        throw new NotFoundException({
            status: HttpStatus.NOT_FOUND,
            message: ErrorMessages.userNotFound,
        });
    }

    @Post('logged')
    @UseGuards(AuthGuard())
    async checkUser() {
        return true;
    }
  }
}
