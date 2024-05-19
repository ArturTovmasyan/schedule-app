import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@user/entity/user.entity';
import { NotificationTypeEnum } from '../enums/notifications.enum';
import { AccessRequest } from 'src/access-request/entities/access-request.entity';

@Entity('notifications')
export class NotificationsEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ name: 'sender_id', type: 'uuid' })
  senderUserId: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @Column({ name: 'receiver_id', type: 'uuid' })
  receiverUserId: string;

  @Column({
    name: 'viewed',
    type: 'boolean',
    default: false,
  })
  viewed?: boolean;

  @Column({
    name: 'type',
    type: 'enum',
    enum: NotificationTypeEnum,
  })
  type: NotificationTypeEnum;

  @ManyToOne(() => AccessRequest, (request) => request.id)
  @JoinColumn({ name: 'access_request_id' })
  accessRequest: AccessRequest;

  @CreateDateColumn()
  createdOn?: Date;

  @UpdateDateColumn() updatedOn?: Date;
  @DeleteDateColumn() deletedOn?: Date;
}
