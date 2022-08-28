import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import {BadRequestException, Injectable} from '@nestjs/common';

import {IResponseMessage} from 'src/components/interfaces/response.interface';
import {CreateAvailabilityDto} from './dto/create-availability.dto';
import {UpdateAvailabilityDto} from './dto/update-availability.dto';
import {Availability} from './entities/availability.entity';
import {User} from '@user/entity/user.entity';
import {ErrorMessages} from "../components/constants/error.messages";

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

  async create(
    user: User,
    createAvailabilityDto: CreateAvailabilityDto,
  ): Promise<Availability> {
    const checkUser = await this.availabilityRepo.findOne({
      where: { user: { id: user.id } },
    });

    if (checkUser) {
      throw new BadRequestException({
        message: ErrorMessages.availabilityExists,
      });
    }

    return await this.availabilityRepo.save({
      user: {id: user.id},
      ...createAvailabilityDto,
    });
  }

  /**
   * @description `Find availability of user`
   * @param user - `Authorized user data`
   * @returns `{availability entity data(Object)}`
   */

  async findAll(user: User): Promise<Availability> {
    return await this.availabilityRepo.findOne({
      user: {id: user.id},
    });
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

  async update(
    user: User,
    updateAvailabilityDto: UpdateAvailabilityDto,
  ): Promise<IResponseMessage> {
    await this.availabilityRepo.update(
      {
        user: { id: user.id },
      },
      { ...updateAvailabilityDto },
    );

    return { message: 'updated' };
  }

  remove(id: number) {
    return `Method not implemented`;
  }
}
