import * as moment from 'moment';
import { In, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';

import { NotificationTypeEnum } from 'src/notifications/enums/notifications.enum';
import { NotificationsService } from 'src/notifications/notifications.service';
import { CreateCalendarAccessDto } from './dto/create-calendar-access.dto';
import { UpdateCalendarAccessDto } from './dto/update-calendar-access.dto';
import { CalendarAccess } from './entities/calendar-access.entity';
import { TimeForAccessEnum } from './enums/access-time.enum';
import { ErrorMessages } from '@shared/error.messages';
import { MailService } from 'src/mail/mail.service';
import { User } from '@user/entity/user.entity';

@Injectable()
export class CalendarAccessService {
  constructor(
    @InjectRepository(CalendarAccess)
    private readonly calendarAccessRepo: Repository<CalendarAccess>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * @description `Share calendar with other person`
   *
   * @param user - `Authorized user data`
   * @param createCalendarAccessDto - `Email(required), comment(optional),time for access(optional)`
   *
   * @returns `Shared successfully`
   */

  async create(
    user: User,
    createCalendarAccessDto: CreateCalendarAccessDto,
  ): Promise<{ message: string; status: number }> {
    if (createCalendarAccessDto.toEmail === user.email) {
      throw new BadRequestException({
        message: ErrorMessages.cantSentYourself,
      });
    }

    await this.checkAccess(user, [createCalendarAccessDto.toEmail]);

    const findUserByEmail = await this.userRepo.findOne({
      where: { email: createCalendarAccessDto.toEmail },
    });

    await this.calendarAccessRepo.upsert(
      {
        accessedUser: { id: findUserByEmail ? findUserByEmail.id : null },
        owner: { id: user.id },
        toEmail: createCalendarAccessDto.toEmail,
        comment: createCalendarAccessDto.comment,
        timeForAccess: createCalendarAccessDto.timeForAccess,
      },
      {
        conflictPaths: ['toEmail', 'owner'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    if (findUserByEmail) {
      await this.notificationsService.create(user, {
        type: NotificationTypeEnum.CalendarAccess,
        receiverUserId: findUserByEmail.id,
      });
    }

    this.mailService.send({
      from: this.configService.get<string>('NO_REPLY_EMAIL'),
      to: createCalendarAccessDto.toEmail,
      subject: `${user.firstName} ${user.lastName} shared their calendar with you`,
      html: `
        <h3>Hello!</h3>
        ${
          findUserByEmail
            ? `<p>${user.firstName} ${user.lastName} shared their calendar with you 
            Please go to <a href='${process.env.WEB_HOST}'>homepage</a> to access calendar.</p>`
            : `<p>${user.firstName} ${user.lastName} shared their calendar with you.
             Please <a href='${process.env.WEB_HOST}register'>Register</a> and access to calendar.</p>`
        }
    `,
    });

    return { message: 'shared successfully', status: HttpStatus.CREATED };
  }

  /**
   * @description `Void function,that validates does userA have access to userB's calendar`
   * @param user - `Authorized user data`
   * @param emails - `email address of accessible user`
   */

  async checkAccess(user: User, emails: string[]): Promise<void> {
    const checkAccess = await this.calendarAccessRepo.findOne({
      where: {
        owner: { id: user.id },
        toEmail: In(emails),
      },
    });

    if (
      checkAccess &&
      (moment().diff(checkAccess.timeForAccess) < 0 ||
        !checkAccess.timeForAccess)
    ) {
      throw new BadRequestException({
        message: ErrorMessages.alreadyHaveAccess,
      });
    }
  }

  /**
   * @description `Find all accessible calendars`
   * @param user - `Authorized user id`
   * @returns `{Array of calendarAccess entity data,count of results}`
   */

  async findAccessed(
    user: User,
  ): Promise<{ data: CalendarAccess[]; count: number }> {
    const [data, count] = await this.calendarAccessRepo
      .createQueryBuilder('calendarAccess')
      .innerJoin('calendarAccess.owner', 'owner')
      .addSelect([
        'owner.id',
        'owner.email',
        'owner.firstName',
        'owner.lastName',
      ])
      .where({ toEmail: user.email })
      .getManyAndCount();

    return { data, count };
  }

  /**
   * @description `Find all shared accesses`
   * @param user - `Authorized user id`
   * @returns `{Array of calendarAccess entity data,count of results}`
   */

  async findShared(
    user: User,
  ): Promise<{ data: CalendarAccess[]; count: number }> {
    const [data, count] = await this.calendarAccessRepo
      .createQueryBuilder('calendarAccess')
      .select([
        'calendarAccess.id',
        'calendarAccess.timeForAccess',
        'calendarAccess.toEmail',
        'calendarAccess.comment',
      ])
      .leftJoin('calendarAccess.accessedUser', 'accessedUser')
      .addSelect([
        'accessedUser.id',
        'accessedUser.email',
        'accessedUser.firstName',
        'accessedUser.lastName',
      ])
      .where({ owner: { id: user.id } })
      .getManyAndCount();

    return { data, count };
  }

  findOne(id: number) {
    return `This action returns a #${id} calendarAccess`;
  }

  update(id: number, updateCalendarAccessDto: UpdateCalendarAccessDto) {
    return `This action updates a #${id} calendarAccess`;
  }

  remove(id: number) {
    return `This action removes a #${id} calendarAccess`;
  }
}
