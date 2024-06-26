import { User } from '@user/entity/user.entity';
import {
  Column,
  Entity,
  PrimaryColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { ISlotMetadata } from '../interfaces/sharable-links.interface';
import { SharableLinkEntity } from './sharable-link.entity';

@Entity('sharable_link_slots')
export class SharableLinkSlotsEntity {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'choosed_by', nullable: true })
  choosedBy: string;

  @OneToOne(() => User, (user) => user.id)
  user: User;

  @Column({ name: 'choosed_by_email', nullable: true })
  choosedByEmail: string;

  @Column({ name: 'link_id' })
  linkId: string;

  @Column({ name: 'meeting_id', default: null })
  meetingId?: string;

  @Column({ name: 'calendar_event_id', default: null })
  calendarEventId?: string;

  @ManyToOne(() => SharableLinkEntity, (link) => link.id)
  @JoinColumn({ name: 'link_id' })
  link: SharableLinkEntity;

  @CreateDateColumn({ nullable: true, precision: 3, name: 'start_date' })
  startDate: Date;

  @CreateDateColumn({ nullable: true, precision: 3, name: 'end_date' })
  endDate: Date;

  @Column({ name: 'metadata', type: 'jsonb' })
  metadata: ISlotMetadata;

  @CreateDateColumn()
  createdOn?: Date;

  @UpdateDateColumn() updatedOn?: Date;
  @DeleteDateColumn() deletedOn?: Date;
}
