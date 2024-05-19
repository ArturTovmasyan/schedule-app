import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { toUserDto, toUserInfoDto } from 'src/components/helpers/mapper';
import { UserCreateDto } from './dto/user-create.dto';
import { UserDto } from './dto/user.dto';
import { User } from '@user/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserUpdateDto } from './dto/user-update.dto';
import {
  comparePasswords,
  generatePassword,
} from '../components/helpers/utils';
import { ErrorMessages } from '../components/constants/error.messages';
import {OauthUserDto} from "@user/dto/user-oauth-create.dto";
import {StatusEnum} from "@user/enums/status.enum";

@Injectable()
export class UsersService {
  public readonly saltRounds = 10;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Invitation)
    private readonly invitationRepo: Repository<Invitation>,
    @InjectRepository(InvitationPendingEmails)
    private readonly invitationPendingEmailsRepo: Repository<InvitationPendingEmails>,
    @InjectRepository(CalendarAccess)
    private readonly calendarAccessRepo: Repository<CalendarAccess>,
    private readonly invitationService: InvitationService,
    private readonly fileUploadService: FileUploadService,
    private readonly calendarAccessService: CalendarAccessService,
    private readonly accessRequestService: AccessRequestService,
  ) {}

  async create(userDto: UserCreateDto): Promise<UserDto> { // TODO add stripeCustomerId to userDTo
    const { email, firstName, lastName, password, stripeCustomerId } = userDto;

    const userInDb = await this.userRepo.findOne({
      where: { email },
      withDeleted: true,
    });

    if (userInDb) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: ErrorMessages.userExist,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const user: User = await this.userRepo.create({
      email,
      firstName,
      lastName,
      password,
      stripeCustomerId
    });

    await this.userRepo.save(user);

    await this.calendarAccessRepo.update(
      { accessedUser: { id: user.id } },
      { toEmail: user.email },
    );

    if (invitationId) {
      const pendingEmails = await this.invitationPendingEmailsRepo.findOne({
        where: { invitation: { id: invitationId } },
        relations: ['user'],
      });

      if (pendingEmails) {
        if (pendingEmails.accessRequest) {
          await this.accessRequestService
            .create(pendingEmails.user, {
              toEmails: [pendingEmails.email],
              comment: pendingEmails.comment,
              timeForAccess: pendingEmails.timeForAccess,
            })
            .catch((err) => {
              console.log(err);
            });
        }

        if (pendingEmails.shareCalendar) {
          await this.calendarAccessService
            .create(pendingEmails.user, {
              toEmails: [pendingEmails.email],
              comment: pendingEmails.comment,
              timeForAccess: pendingEmails.timeForAccess,
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }

      await this.invitationService.update(invitationId);
    }

    return toUserDto(user);
  }

  async registerGoogleUser(userDto: any): Promise<OauthUserDto> {
    const user = new User();
    user.email = userDto.email;
    user.oauthId = userDto.sub;
    user.firstName = userDto.given_name;
    user.lastName = userDto.family_name;
    user.provider = userDto.provider;
    user.password = generatePassword(10);
    user.status = StatusEnum.active;
    user.stripeCustomerId = userDto.stripeCustomerId;
    await this.userRepo.save(user);

    await Promise.all([
      this.calendarAccessRepo.update(
        { accessedUser: { id: user.id } },
        { toEmail: user.email },
      ),
      this.invitationRepo.update(
        { toEmail: user.email, status: InvitationStatusEnum.PreSocialLogin },
        { status: InvitationStatusEnum.Accepted },
      ),
    ]);

    return user;
  }

  async registerMicrosoftUser(userDto: any): Promise<OauthUserDto> {
    const user = new User();
    user.email = userDto.userPrincipalName;
    user.oauthId = userDto.id;
    user.firstName = userDto.givenName;
    user.lastName = userDto.surname;
    user.provider = userDto.provider;
    user.password = generatePassword(10);
    user.status = StatusEnum.active;
    user.stripeCustomerId = userDto.stripeCustomerId;

    await this.userRepo.save(user);

    await Promise.all([
      this.calendarAccessRepo.update(
        { accessedUser: { id: user.id } },
        { toEmail: user.email },
      ),
      this.invitationRepo.update(
        { toEmail: user.email, status: InvitationStatusEnum.PreSocialLogin },
        { status: InvitationStatusEnum.Accepted },
      ),
    ]);

    return user;
  }

  async update(id: string, userDto: UserUpdateDto): Promise<UserDto> {
    // const { firstName, lastName, email } = userDto;

    let user: User = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException();
    }

    // user = {
    //   id,
    //   firstName,
    //   lastName,
    //   email,
    //   status: 0,
    //   password: user.password,
    //   oauthId: 0,
    //   provider: "",
    //   stripeCustomerId: "",
    //   subscription: null
    // };

    await this.userRepo.update({ id }, user);
    return user;
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

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return await bcrypt.hash(password, salt);
  }

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
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: ErrorMessages.userNotFound,
      });
    }

    return toUserDto(user);
  }

  async findOneByEmail(email): Promise<UserDto> {
    const user = await this.userRepo.findOne({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: ErrorMessages.userNotFound,
      });
    }
    return toUserDto(user);
  }

  async findByLogin({ email, password }): Promise<UserUpdateDto> {
    const user = await this.userRepo.findOne({
      where: {
        email: email,
        status: StatusEnum.active,
        oauthId: 0,
      },
    });

    if (!user) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: ErrorMessages.userNotFound,
      });
    }

    if (!(await comparePasswords(user.password, password))) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    return toUserInfoDto(user);
  }
}
auth.service.ts
