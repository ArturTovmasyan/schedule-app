import { User } from '@user/entity/user.entity';
import {
  Column,
  Entity,
  PrimaryColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SharableLinkEntity } from './sharable-link.entity';

@Entity('sharable_link_attendees')
export class SharableLinkAttendeesEntity {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => SharableLinkEntity, (link) => link.id)
  @JoinColumn({ name: 'link_id' })
  link: SharableLinkEntity;

  @Column({ name: 'link_id' })
  linkId: string;

  @CreateDateColumn()
  createdOn?: Date;

  @UpdateDateColumn() updatedOn?: Date;
  @DeleteDateColumn() deletedOn?: Date;
}
