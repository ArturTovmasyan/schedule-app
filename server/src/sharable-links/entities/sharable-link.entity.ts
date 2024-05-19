import { User } from '@user/entity/user.entity';
import {
  Column,
  Entity,
  PrimaryColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { MeetViaEnum } from '../enums/sharable-links.enum';
import { SharableLinkAttendeesEntity } from './sharable-link-attendees.entity';
import { SharableLinkSlotsEntity } from './sharable-link-slots.entity';

@Entity('sharable_links')
export class SharableLinkEntity {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'shared_by', nullable: false })
  sharedBy: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'shared_by' })
  user: User;

  @OneToMany(() => SharableLinkAttendeesEntity, (attendee) => attendee.link)
  attendees: SharableLinkAttendeesEntity[];

  @OneToMany(() => SharableLinkSlotsEntity, (slot) => slot.link)
  slots: SharableLinkSlotsEntity[];

  @Column({ type: 'varchar', nullable: true, name: 'title' })
  title: string;

  @Column({ name: 'meet_via', enum: MeetViaEnum })
  meetVia: MeetViaEnum;

  @Column({ name: 'link' })
  link: string;

  @CreateDateColumn()
  createdOn?: Date;

  @UpdateDateColumn() updatedOn?: Date;
  @DeleteDateColumn() deletedOn?: Date;
}
