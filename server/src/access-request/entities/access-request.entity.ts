import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@user/entity/user.entity';
import { RequestStatusEnum } from '../enums/requestStatus.enum';

@Entity('access-request')
export class AccessRequest {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'applicant_id' })
  applicant: User;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @Column({ name: 'receiver_id', type: 'uuid' })
  receiverUserId: string;

  @Column({ name: 'time_for_access', type: 'timestamptz' })
  timeForAccess: Date;

  @Column({ name: 'to_email', type: 'varchar' })
  toEmail: string;

  @Column({ name: 'comment', type: 'text' })
  comment: string;

  @Column({
    name: 'status',
    type: 'enum',
    enumName: 'request_status',
    default: RequestStatusEnum.Pending,
  })
  status?: RequestStatusEnum;

  @CreateDateColumn()
  createdOn?: Date;

  @UpdateDateColumn() updatedOn?: Date;
  @DeleteDateColumn() deletedOn?: Date;
}
