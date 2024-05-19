import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';

import { CreateCalendarAccessibilityDto } from './dto/create-calendar-accessibility.dto';
import { UpdateCalendarAccessibilityDto } from './dto/update-calendar-accessibility.dto';
import { CalendarAccessibility } from './entities/calendar-accessibility.entity';
import { AccessibilityTypeEnum } from './enums/calendar-accessibility.enum';
import { ErrorMessages } from 'src/components/constants/error.messages';
import { User } from '@user/entity/user.entity';
import {
  IResponseMessage,
  IResponse,
} from 'src/components/interfaces/response.interface';

@Injectable()
export class CalendarAccessibilityService {
  constructor(
    @InjectRepository(CalendarAccessibility)
    private readonly calendarAccessibilityRepo: Repository<CalendarAccessibility>,
  ) {}

  /**
   * @description `Create calendar accessibility data for user`
   *
   * @param user - `Authorized user data`
   * @param createCalendarAccessibilityDto - `AccessibilityType(public,domain,request)`
   *
   * @returns `{message:'created',status:201}`
   */

  async create(
    user: User,
    createCalendarAccessibilityDto: CreateCalendarAccessibilityDto,
  ): Promise<IResponseMessage> {
    const checkExists = await this.calendarAccessibilityRepo.count({
      user: { id: user.id },
    });

    if (checkExists) {
      throw new BadRequestException({
        message: ErrorMessages.accessibilityExists,
      });
    }

    await this.calendarAccessibilityRepo.save({
      user: { id: user.id },
      accessibilityType: createCalendarAccessibilityDto.accessibilityType,
      domains:
        createCalendarAccessibilityDto.accessibilityType ===
        AccessibilityTypeEnum.Domain
          ? createCalendarAccessibilityDto.domains
          : [],
    });

    return { message: 'Created', status: HttpStatus.CREATED };
  }

  /**
   * @description `Get user's calendar accessibility data`
   * @param user - `Authorized user data`
   * @returns `{CalendarAccessibility entity data}`
   */

  async findAll(user: User): Promise<IResponse<CalendarAccessibility>> {
    const data = await this.calendarAccessibilityRepo.findOne({
      where: { user: { id: user.id } },
    });

    return { data };
  }

  findOne(id: number) {
    return `This action returns a #${id} calendarAccessibility`;
  }

  /**
   * @description `Update user calendar accessibility data`
   *
   * @param user - `Authorized user data`
   * @param updateCalendarAccessibilityDto - `optional(accessibilityType,domains)`
   *
   * @returns `{message:'updated',status:202}`
   */

  async update(
    user: User,
    updateCalendarAccessibilityDto: UpdateCalendarAccessibilityDto,
  ): Promise<IResponseMessage> {
    const checkExists = await this.calendarAccessibilityRepo.count({
      user: { id: user.id },
    });

    if (!checkExists) {
      throw new BadRequestException({
        message: ErrorMessages.accessibilityNotExists,
      });
    }

    await this.calendarAccessibilityRepo.update(
      { user: { id: user.id } },
      {
        ...updateCalendarAccessibilityDto,
      },
    );

    return { message: 'Updated', status: HttpStatus.ACCEPTED };
  }

  /**
   * @description `Delete user's calendar accessibility data`
   * @param user - `Authorized user data`
   * @returns `{message:'deleted',status:202}`
   */

  async remove(user: User): Promise<IResponseMessage> {
    await this.calendarAccessibilityRepo.delete({ user: { id: user.id } });

    return { message: 'deleted', status: HttpStatus.ACCEPTED };
  }
}
