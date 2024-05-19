import {
    BadRequestException,
    ForbiddenException,
    HttpException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import {UsersService} from '@user/users.service';
import {JwtService} from '@nestjs/jwt';
import {UserCreateDto} from '@user/dto/user-create.dto';
import {RegistrationStatus} from 'src/auth/interfaces/regisitration-status.interface';
import {JwtPayload} from 'src/auth/interfaces/payload.interface';
import {UserDto} from '@user/dto/user.dto';
import {LoginStatus} from './interfaces/login-status.interface';
import {SignInDto} from "./dto/signin.dto";
import {MailService} from "../mail/mail.service";
import {ErrorMessages} from "../components/constants/error.messages";
import {StatusEnum} from "@user/enums/status.enum";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "@user/entity/user.entity";
import {Repository} from "typeorm";
import {ChangePasswordDto} from "./dto/change-password.dto";
import {UserUpdateDto} from "@user/dto/user-update.dto";
import {ConfigService} from "@nestjs/config";
import {OauthProvider} from "./enums/oauth.provider.enum";
import {PaymentService} from "../payment/payment.service";

@Injectable()
export class AuthService {
    private readonly appHost: string;
    private readonly REMEMBER_ME_LIFETIME = '30d';
    private readonly CONFIRMATION_TOKEN_TIME = '6h';

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
        private readonly configService: ConfigService,
        private readonly stripeService: PaymentService,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {
        this.appHost = configService.get<string>('WEB_HOST');
    }

    private _createToken({id, email, stripeCustomerId}: UserUpdateDto, expiresTime: number | string | null = null, rememberMe: boolean = false): any {
        const user: JwtPayload = {id, email};

<<<<<<< HEAD
        if (!expiresTime) {
            expiresTime = rememberMe ? this.REMEMBER_ME_LIFETIME : this.configService.get<string>('JWT_EXPIRES_IN');
=======
  async login(dto: SignInDto): Promise<LoginStatus> {
    const user = await this.usersService.findByLogin(dto);
    const token = this._createToken(user, null, dto.remember);
    const stripeCustomerId = user.stripeCustomerId;
    return {
      stripeCustomerId,
      ...token,
    };
  }

  async validateUser(payload: JwtPayload): Promise<UserDto> {
    const user = await this.usersService.findOneByEmail(payload.email);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  public async verifyToken(token): Promise<any> | null {
    const data = this.jwtService.verify(token) as JwtPayload;
    const user = await this.userRepo.findOne(data.id);
    let isActive = false;

    if (user.stripeSubscriptionId) {
      isActive = await this.subService.isActive(user.stripeSubscriptionId);
    }

    if (user) {
      return { user, isActive };
    }

    return null;
  }

  async resetPassword(email: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: ErrorMessages.userNotFound,
      });
    }

    if (user.provider) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: ErrorMessages.socialAccountExistError,
      });
    }

    const token = await this._createToken(user, this.CONFIRMATION_TOKEN_TIME);
    const changeLink = `${this.appHost}change-password?token=${token.accessToken}`;

    this.mailService.send({
      from: this.configService.get<string>('NO_REPLY_EMAIL'),
      to: user.email,
      subject: 'Reset Handshake Account Password',
      html: `
                <h3>Hello ${user.firstName}!</h3>
                <p>Please use this <a href="${changeLink}">link</a> to reset your password.</p>
            `,
    });

    return true;
  }

  async confirmRegistration(token: string): Promise<boolean> {
    const { user } = await this.verifyToken(token);

    if (user && user.status === StatusEnum.pending) {
      user.status = StatusEnum.active;
      const data = await this.userRepo.update(user.id, user);
      return data.affected > 0;
    }

    throw new BadRequestException({
      status: HttpStatus.BAD_REQUEST,
      message: ErrorMessages.confirmError,
    });
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<boolean> {
    const password = await this.usersService.hashPassword(
      changePasswordDto.password,
    );
    await this.userRepo.update(userId, { password });
    return true;
  }

  async validateGoogleLogin(data: any): Promise<any> {
    const { sub, email } = data;
    const oauthId = sub;
    let user: UserDto = await this.userRepo.findOne({ where: { oauthId } });

    if (!user) {
      user = await this.userRepo.findOne({ where: [{ email: email }] });
      if (user) {
        return {
          error: ErrorMessages.socialAccountExist,
          status: HttpStatus.FORBIDDEN,
        };
      }

      const fullName = data.given_name + ' ' + data.family_name;
      const customerData = await this.stripeService.createCustomer(
        fullName,
        data.email,
      );

      data.stripeCustomerId = customerData.id;
      data.provider = OauthProvider.GOOGLE;
      user = await this.usersService.registerGoogleUser(data);
    }

    return this._createToken(user, '30d').accessToken;
  }

  async validateMicrosoftLogin(data: any): Promise<any> {
    try {
      const { id, userPrincipalName } = data;
      const oauthId = id;
      let user: UserDto = await this.userRepo.findOne({ where: { oauthId } });

      if (!user) {
        user = await this.userRepo.findOne({
          where: [{ email: userPrincipalName }],
        });

        if (user) {
          new ForbiddenException({
            message: ErrorMessages.socialAccountExist,
            status: HttpStatus.FORBIDDEN,
          });
>>>>>>> 166b31b (fix microsoft calendar tenant id bug)
        }

        const accessToken = this.jwtService.sign(user, {
            expiresIn: expiresTime
        });

        return {
            expiresIn: expiresTime,
            stripeCustomerId,
            accessToken,
        };
    }

    async register(userDto: UserCreateDto, invitationId?: string): Promise<RegistrationStatus> {
        let status: RegistrationStatus = {
            success: true,
            message: 'user registered',
        };

        try {
            let fullName = userDto.firstName + ' ' + userDto.lastName;
            const stripeCustomer = await this.stripeService.createCustomer(fullName, userDto.email);
            userDto.stripeCustomerId = stripeCustomer.id;
            const user = await this.usersService.create(userDto);
            this.sendConfirmation(user);
        } catch (error) {
            status = {
                success: false,
                message: error,
            };
        }

        return status;
    }

    async login(dto: SignInDto): Promise<LoginStatus> {
        const user = await this.usersService.findByLogin(dto);
        const token = this._createToken(user, null, dto.remember);
        const stripeCustomerId = user.stripeCustomerId;
        return {
            stripeCustomerId,
            ...token,
        };
    }

    async validateUser(payload: JwtPayload): Promise<UserDto> {
        const user = await this.usersService.findOneByEmail(payload.email);
        if (!user) {
            throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
        }
        return user;
    }

    public async verifyToken(token): Promise<User>|null {
        const data = this.jwtService.verify(token) as JwtPayload;
        const user = await this.userRepo.findOne(data.id);

        if (user) {
            return user
        }

        return null;
    }

    sendConfirmation(user: UserDto) {
        const token = this._createToken(user, this.CONFIRMATION_TOKEN_TIME);
        const confirmLink = `${this.appHost}confirm?token=${token.accessToken}`;

        this.mailService.send({
            from: this.configService.get<string>('NO_REPLY_EMAIL'),
            to: user.email,
            subject: 'Verify Handshake Account',
            html: `
                <h3>Hello ${user.firstName}!</h3>
                <p>Please use this <a href="${confirmLink}">link</a> to confirm your account.</p>
            `,
        });
    }

    async resetPassword(email: string): Promise<boolean> {
        const user = await this.userRepo.findOne({ where: { email } });

        if (!user) {
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: ErrorMessages.userNotFound,
            });
        }

        if (user.provider) {
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: ErrorMessages.socialAccountExistError,
            });
        }

        const token = await this._createToken(user, this.CONFIRMATION_TOKEN_TIME);
        const changeLink = `${this.appHost}change-password?token=${token.accessToken}`;

        this.mailService.send({
            from: this.configService.get<string>('NO_REPLY_EMAIL'),
            to: user.email,
            subject: 'Reset Handshake Account Password',
            html: `
                <h3>Hello ${user.firstName}!</h3>
                <p>Please use this <a href="${changeLink}">link</a> to reset your password.</p>
            `,
        });

        return true;
    }

    async confirmRegistration(token: string): Promise<boolean> {
        const user: Pick<UserDto, 'id' | 'status'> = await this.verifyToken(token);

        if (user && user.status === StatusEnum.pending) {
            user.status = StatusEnum.active;
            const data = await this.userRepo.update(user.id, user);
            return data.affected > 0;
        }

        throw new BadRequestException({
            status: HttpStatus.BAD_REQUEST,
            message: ErrorMessages.confirmError,
        });
    }

    async changePassword(
        userId: string,
        changePasswordDto: ChangePasswordDto,
    ): Promise<boolean> {
        const password = await this.usersService.hashPassword(
            changePasswordDto.password,
        );
        await this.userRepo.update(userId, { password });
        return true;
    }

    async validateGoogleLogin(data: any): Promise<any> {
        let {sub, email} = data;
        let oauthId = sub;
        let user: UserDto = await this.userRepo.findOne({where: {oauthId}});

        if (!user) {
            user = await this.userRepo.findOne({where: [{email: email}]});
            if (user) {
                throw new ForbiddenException(
                    {
                        message: ErrorMessages.socialAccountExist,
                        status: HttpStatus.FORBIDDEN
                    }
                );
            }

            debugger;
            let fullName = data.given_name + ' ' + data.family_name;
            const customerData = await this.stripeService.createCustomer(fullName, data.email);
            data.stripeCustomerId = customerData.id;
            data.provider = OauthProvider.GOOGLE;
            user = await this.usersService.registerGoogleUser(data);
        }

        return this._createToken(user, '30d');
    }

    async validateMicrosoftLogin(data: any): Promise<any> {
        try {
            let {id, mail} = data;
            let oauthId = id;
            let user: UserDto = await this.userRepo.findOne({where: {oauthId}});

            if (!user) {
                user = await this.userRepo.findOne({where: [{email: mail}]});
                if (user) {
                    new ForbiddenException(
                        {
                            message: ErrorMessages.socialAccountExist,
                            status: HttpStatus.FORBIDDEN
                        }
                    );
                }

                const customerData = await this.stripeService.createCustomer(data.displayName, data.mail);
                data.stripeCustomerId = customerData.id;
                data.provider = OauthProvider.MICROSOFT;
                user = await this.usersService.registerMicrosoftUser(data);
            }

            return this._createToken(user, '30d');

        } catch (err) {
            throw new InternalServerErrorException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: err.message,
            });
        }
    }

    sendConfirmation(user: UserDto) {
        const token = this._createToken(user, this.CONFIRMATION_TOKEN_TIME);
        const confirmLink = `${this.appHost}confirm?token=${token.accessToken}`;

        this.mailService.send({
            from: this.configService.get<string>('NO_REPLY_EMAIL'),
            to: user.email,
            subject: 'Verify Handshake Account',
            html: `
                <h3>Hello ${user.firstName}!</h3>
                <p>Please use this <a href="${confirmLink}">link</a> to confirm your account.</p>
            `,
        });
    }
}
