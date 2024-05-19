import {
    BadRequestException, ForbiddenException,
    HttpException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    NotFoundException
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
import {ErrorMessages} from "@shared/error.messages";
import {StatusEnum} from "@user/enums/status.enum";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "@user/entity/user.entity";
import {Repository} from "typeorm";
import {ChangePasswordDto} from "./dto/change-password.dto";
import {UserUpdateDto} from "@user/dto/user-update.dto";
import {ConfigService} from "@nestjs/config";
import {OauthProvider} from "./enums/oauth.provider.enum";

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
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {
        this.appHost = configService.get<string>('WEB_HOST');
    }

    private _createToken({id, email}: UserUpdateDto, expiresTime: number | string | null = null, rememberMe: boolean = false): any {
        const user: JwtPayload = {id, email};

        if (!expiresTime) {
            expiresTime = rememberMe ? this.REMEMBER_ME_LIFETIME : this.configService.get<string>('JWT_EXPIRES_IN');
        }

        const accessToken = this.jwtService.sign(user, {
            expiresIn: expiresTime
        });

        return {
            expiresIn: expiresTime,
            accessToken,
        };
    }

    async register(userDto: UserCreateDto): Promise<RegistrationStatus> {
        let status: RegistrationStatus = {
            success: true,
            message: 'user registered',
        };

        try {
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
        return {
            // user,
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
        const user = await this.userRepo.findOne({where: {id: data.id}});

        if (user) {
            return user;
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
        const user = await this.userRepo.findOne({where: {email}});

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

    async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<boolean> {
        const password = await this.usersService.hashPassword(changePasswordDto.password);
        await this.userRepo.update(userId, {password});
        return true;
    }

    async validateOAuthLogin(data: any, provider: OauthProvider): Promise<string> {
        try {
            let {sub} = data;
            let oauthId = sub;
            let user: UserDto = await this.userRepo.findOne({where: {oauthId}});

            if (!user) {
                user = await this.userRepo.findOne({where: [{email: data.email}]});
                if (user) {
                     new ForbiddenException(
                        {
                            message: "User already exists, but Social account was not connected to user's account",
                            status: HttpStatus.FORBIDDEN
                        }
                    );
                }
                user = await this.usersService.registerOAuthUser(data, provider);
            }

            return this._createToken(user, '30d').accessToken;

        } catch (err) {
            throw new InternalServerErrorException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: err.message,
            });
        }
    }
}
