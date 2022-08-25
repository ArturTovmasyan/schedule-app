import * as moment from 'moment';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';

import { CreateCalendarAccessDto } from './dto/create-calendar-access.dto';
import { UpdateCalendarAccessDto } from './dto/update-calendar-access.dto';
import { CalendarAccess } from './entities/calendar-access.entity';
import { TimeForAccessEnum } from './enums/access-time.enum';
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
  ): Promise<string> {
    const checkExists = await this.calendarAccessRepo.findOne({
      where: {
        owner: { id: user.id },
        toEmail: createCalendarAccessDto.toEmail,
      },
    });

    const findUserByEmail = await this.userRepo.findOne({
      where: { email: createCalendarAccessDto.toEmail },
    });

    if (
      checkExists &&
      (moment().diff(checkExists.timeForAccess) < 0 ||
        !checkExists.timeForAccess)
    ) {
      throw new BadRequestException({
        message: 'This email already has access',
      });
    }

    let timeForAccess: Date | null = null;

    if (createCalendarAccessDto.timeForAccess === TimeForAccessEnum.month) {
      timeForAccess = moment().add(30, 'day').toDate();
    } else if (
      createCalendarAccessDto.timeForAccess === TimeForAccessEnum.week
    ) {
      timeForAccess = moment().add(7, 'day').toDate();
    } else if (
      createCalendarAccessDto.timeForAccess === TimeForAccessEnum.quarter
    ) {
      timeForAccess = moment().add(3, 'month').toDate();
    }

    await this.calendarAccessRepo.upsert(
      {
        accessedUser: { id: findUserByEmail ? findUserByEmail.id : null },
        owner: { id: user.id },
        toEmail: createCalendarAccessDto.toEmail,
        comment: createCalendarAccessDto.comment,
        timeForAccess,
      },
      {
        conflictPaths: ['toEmail', 'owner'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    await this.mailService.send({
      from: this.configService.get<string>('NO_REPLY_EMAIL'),
      to: createCalendarAccessDto.toEmail,
      subject: `${user.firstName} ${user.lastName} shared their calendar with you`,
      html: `
        <h3>Hello!</h3>
        <p>${user.firstName} ${user.lastName} shared their calendar with you</p>
    `,
    });

    return 'shared successfully';
  }

  /**
   * @description `Find all accessable calendars`
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
