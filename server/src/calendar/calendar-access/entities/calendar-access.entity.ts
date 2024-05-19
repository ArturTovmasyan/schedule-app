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

@Entity('calendar-event-access')
export class CalendarAccess {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'accessed_user_id' })
  accessedUser: User;

  @Column({ name: 'accessed_user_id', type: 'uuid' })
  accessedUserId: string;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @Column({ name: 'time_for_access', type: 'timestamptz' })
  timeForAccess: Date;

  @Column({ name: 'to_email', type: 'varchar' })
  toEmail: string;

  @Column({ name: 'comment', type: 'text' })
  comment: string;

  @CreateDateColumn()
  createdOn?: Date;

  @UpdateDateColumn() updatedOn?: Date;
  @DeleteDateColumn() deletedOn?: Date;
}
