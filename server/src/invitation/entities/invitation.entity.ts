import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';
import { User } from '@user/entity/user.entity';
import { InvitationStatusEnum } from '../enums/invitation-status.enum';

@Entity('invitation')
export class Invitation {
  @PrimaryColumn('uuid') id: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'to_email', type: 'varchar' })
  toEmail: string;

  @Column({ name: 'message', type: 'text' })
  message: string;

  @Column({
    name: 'status',
    enum: InvitationStatusEnum,
    default: InvitationStatusEnum.Pending,
  })
  status: InvitationStatusEnum;

  @CreateDateColumn()
  createdOn?: Date;

  @UpdateDateColumn() updatedOn?: Date;
  @DeleteDateColumn() deletedOn?: Date;
}
