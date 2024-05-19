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
import { Invitation } from './invitation.entity';

@Entity('invitation_pending_emails')
export class InvitationPendingEmails {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Invitation, (invitation) => invitation.id)
  @JoinColumn({ name: 'invitation_id' })
  invitation: Invitation;

  @Column({
    name: 'email',
    nullable: false,
    type: 'varchar',
  })
  email: string;

  @Column({ name: 'comment', type: 'text' })
  comment: string;

  @Column({
    name: 'access_request',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  accessRequest?: boolean;

  @Column({
    name: 'share_calendar',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  shareCalendar?: boolean;

  @Column({ name: 'time_for_access', type: 'timestamptz', default: null })
  timeForAccess: Date;

  @CreateDateColumn()
  createdOn?: Date;

  @UpdateDateColumn() updatedOn?: Date;
  @DeleteDateColumn() deletedOn?: Date;
}
