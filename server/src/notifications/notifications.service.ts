import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';

import { AccessRequest } from 'src/access-request/entities/access-request.entity';
import { ErrorMessages } from 'src/components/constants/error.messages';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsEntity } from './entities/notification.entity';
import { NotificationTypeEnum } from './enums/notifications.enum';
import { User } from '@user/entity/user.entity';
import {
  IResponseMessage,
  IResponse,
} from 'src/components/interfaces/response.interface';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationsEntity)
    private readonly notificationsRepo: Repository<NotificationsEntity>,
    @InjectRepository(AccessRequest)
    private readonly accessRequestRepo: Repository<AccessRequest>,
  ) {}

  /**
   * @description `Create new notification`
   *
   * @param user - `Authorized user data`
   * @param createNotificationDto - `id of reciever user,notification type,and access request id(optional)`
   *
   * @returns `Created`
   */

  async create(
    user: User,
    createNotificationDto: CreateNotificationDto,
  ): Promise<IResponseMessage> {
    if (
      createNotificationDto.type === NotificationTypeEnum.AccessRequest &&
      !createNotificationDto.accessRequestId
    ) {
      throw new BadRequestException({
        message: ErrorMessages.accessRequestIdNotProvided,
      });
    }

    if (createNotificationDto.accessRequestId) {
      const checkExist = await this.accessRequestRepo.findOne({
        id: createNotificationDto.accessRequestId,
      });

      if (!checkExist) {
        throw new BadRequestException({
          message: ErrorMessages.accessRequestNotFound,
        });
      }
    }

    await this.notificationsRepo.save({
      sender: { id: user.id },
      receiver: { id: createNotificationDto.receiverUserId },
      type: createNotificationDto.type,
      accessRequest: {
        id:
          createNotificationDto.type === NotificationTypeEnum.AccessRequest
            ? createNotificationDto.accessRequestId
            : undefined,
      },
    });

    return { message: 'created', status: HttpStatus.CREATED };
  }

  /**
   * @description `Find list of user's notifications`
   * @param user - `Authorized user data`
   * @returns `Array of NotificationsEntity data`
   */

  async findAll(user: User): Promise<IResponse<NotificationsEntity[]>> {
    const [data, total] = await this.notificationsRepo
      .createQueryBuilder('notification')
      .select([
        'notification.id',
        'notification.viewed',
        'notification.type',
        'notification.createdOn',
      ])
      .leftJoin('notification.sender', 'sender')
      .addSelect(['sender.id', 'sender.firstName', 'sender.lastName'])
      .leftJoin('notification.accessRequest', 'accessRequest')
      .addSelect([
        'accessRequest.id',
        'accessRequest.timeForAccess',
        'accessRequest.status',
        'accessRequest.createdOn',
      ])
      .where('notification.receiverUserId =:userId', { userId: user.id })
      .orderBy('notification.viewed', 'ASC')
      .addOrderBy('notification.createdOn', 'DESC')
      .getManyAndCount();

    return { data, metadata: { total } };
  }

  /**
   * @description `Find count of unread notifications`
   * @param user - `Authorized user's data`
   * @returns `Count`
   */

  async findUnreadCount(user: User): Promise<IResponse<number>> {
    const data = await this.notificationsRepo.count({
      where: { receiverUserId: user.id, viewed: false },
    });

    return { data };
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  /**
   * @description `Mark as read all notifications excluding access requests`
   * @param user - `Authorized user data`
   * @returns `updated`
   */

  async markAsRead(user: User): Promise<IResponseMessage> {
    await this.notificationsRepo.update(
      {
        receiverUserId: user.id,
        type: Not(NotificationTypeEnum.AccessRequest),
      },

      { viewed: true },
    );

    return { message: 'updated', status: HttpStatus.ACCEPTED };
  }

  /**
   * @descripiton `Mark notification as read by ID`
   *
   * @param id - `ID of notification`
   * @param user - `Authorized user data`
   *
   * @returns `updated`
   */

  async markAsReadById(id: string, user: User): Promise<IResponseMessage> {
    await this.notificationsRepo.update(
      {
        id,
        receiverUserId: user.id,
      },

      { viewed: true },
    );

    return { message: 'updated', status: HttpStatus.ACCEPTED };
  }

  /**
   * @description `Delete notification by id`
   *
   * @param id - `ID of notification`
   * @param user - `Authorized user data`
   *
   * @returns `deleted`
   */

  async remove(id: string, user: User): Promise<IResponseMessage> {
    await this.notificationsRepo.delete({
      id,
      receiverUserId: user.id,
    });

    return { message: 'deleted', status: HttpStatus.ACCEPTED };
  }
}
