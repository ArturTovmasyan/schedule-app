import { In, Not, Repository } from 'typeorm';
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
   * @param createNotificationsDto
   *
   * @returns `Created`
   */

  async create(
    user: User,
    createNotificationsDto: CreateNotificationDto[],
  ): Promise<IResponseMessage> {
    const accessRequestIds: string[] = [];
    const BulkNotificationsData = [];

    createNotificationsDto.forEach((notification) => {
      if (
        notification.type === NotificationTypeEnum.AccessRequest &&
        !notification.accessRequestId
      ) {
        throw new BadRequestException({
          message: ErrorMessages.accessRequestIdNotProvided,
        });
      }

      if (notification.accessRequestId) {
        accessRequestIds.push(notification.accessRequestId);
      }

      BulkNotificationsData.push({
        sender: { id: user.id },
        receiver: { id: notification.receiverUserId },
        type: notification.type,
        accessRequest: {
          id:
            notification.type === NotificationTypeEnum.AccessRequest
              ? notification.accessRequestId
              : undefined,
        },
      });
    });

    if (accessRequestIds.length) {
      const checkExist = await this.accessRequestRepo.find({
        id: In(accessRequestIds),
      });

      if (checkExist.length !== createNotificationsDto.length) {
        throw new BadRequestException({
          message: ErrorMessages.accessRequestNotFound,
        });
      }
    }

    await this.notificationsRepo
      .createQueryBuilder()
      .insert()
      .into(NotificationsEntity)
      .values(BulkNotificationsData)
      .execute();

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
   * @description `Find list of user's notifications`
   * @param user - `Authorized user data`
   * @returns `Array of NotificationsEntity data where viewed = false`
   */

  async findAllPending(user: User): Promise<IResponse<NotificationsEntity[]>> {
    const [data, total] = await this.notificationsRepo
      .createQueryBuilder('notification')
      .select([
        'notification.id',
        'notification.viewed',
        'notification.type',
        'notification.createdOn',
      ])
      .leftJoin('notification.sender', 'sender')
      .addSelect([
        'sender.id',
        'sender.firstName',
        'sender.lastName',
        'sender.avatar',
      ])
      .leftJoin('notification.accessRequest', 'accessRequest')
      .addSelect([
        'accessRequest.id',
        'accessRequest.timeForAccess',
        'accessRequest.status',
        'accessRequest.createdOn',
      ])
      .where('notification.receiverUserId =:userId', { userId: user.id })
      .andWhere('notification.viewed =:viewed', { viewed: false })
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
   * @description `Mark notification as read by ID`
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
