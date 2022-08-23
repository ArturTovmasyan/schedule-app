import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';

import { AVAILABILITY_EXISTS } from 'src/components/constants/availability.const';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { Availability } from './entities/availability.entity';
import { User } from '@user/entity/user.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private readonly availabilityRepo: Repository<Availability>,
  ) {}

  /**
   * @description `Create Availability for authorized user`
   *
   * @param user - `Authorized user data`
   * @param createAvailabilityDto - `Availability dto data`
   *
   * @returns `{Created Availability data}`
   */

  async create(user: User, createAvailabilityDto: CreateAvailabilityDto) {
    const checkUser = await this.availabilityRepo.findOne({
      where: { user: { id: user.id } },
    });

    if (checkUser) {
      throw new BadRequestException({
        message: AVAILABILITY_EXISTS,
      });
    }

    const data = await this.availabilityRepo.save({
      user: { id: user.id },
      ...createAvailabilityDto,
    });

    return data;
  }

  /**
   * @description `Find availability of user`
   * @param user - `Authorized user data`
   * @returns `{availability entity data(Object)}`
   */

  async findAll(user: User) {
    const data = await this.availabilityRepo.findOne({
      user: { id: user.id },
    });

    return data;
  }

  findOne(id: number) {
    return `method not implemented`;
  }

  /**
   * @description `Update user Availability data`
   *
   * @param user - `Authorized user data`
   * @param updateAvailabilityDto - `optional create Availability dto data`
   *
   * @returns `{updated}`
   */

  async update(user: User, updateAvailabilityDto: UpdateAvailabilityDto) {
    await this.availabilityRepo.update(
      {
        user: { id: user.id },
      },
      { ...updateAvailabilityDto },
    );

    return 'updated';
  }

  remove(id: number) {
    return `Method not implemented`;
  }
}
