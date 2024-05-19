import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException
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
import {statusEnum} from "@user/enums/status.enum";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "@user/entity/user.entity";
import {Repository} from "typeorm";
import {ChangePasswordDto} from "./dto/change-password.dto";
import {UserUpdateDto} from "@user/dto/user-update.dto";
import {ConfigService} from "@nestjs/config";

enum Provider {
    GOOGLE = 'google'
}


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

    async register(userDto: UserCreateDto): Promise<RegistrationStatus> {
        let status: RegistrationStatus = {
            success: true,
            message: 'user registered',
        };

        try {
            const user = await this.usersService.create(userDto);
            await this.sendConfirmation(user);
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

    private _createToken({
                             id,
                             email
                         }: UserUpdateDto, expiresTime: number | string | null = null, rememberMe: boolean = false): any {
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

    public async verifyToken(token): Promise<any> {
        const data = this.jwtService.verify(token) as JwtPayload;
        const user = await this.userRepo.findOne({where: {id: data.id}});

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
        const token = await this._createToken(user, this.CONFIRMATION_TOKEN_TIME);
        const confirmLink = `${this.appHost}confirm?token=${token.accessToken}`;

        await this.mailService.send({
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

        const token = await this._createToken(user, this.CONFIRMATION_TOKEN_TIME);
        const changeLink = `${this.appHost}change-password?token=${token.accessToken}`;

        // TODO use microservice for send by queue
        await this.mailService.send({
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
        await this.userRepo.update(userId, {password});
        return true;
    }

    async validateOAuthLogin(googleId: string, provider: Provider): Promise<string> {
        try {
            // TODO create repo. method
            // let user: User = await this.usersService.findOneByThirdPartyId(googleId, provider);

            const payload = {
                googleId,
                provider
            }

            return this.jwtService.sign(payload, {expiresIn: '30d'});
        } catch (err) {
            throw new InternalServerErrorException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: err.message,
            });
        }
    }
}
