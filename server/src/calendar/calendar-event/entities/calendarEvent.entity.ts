import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@user/entity/user.entity';
import { EventTypeEnum } from '../enums/eventType.enum';

@Entity()
export class CalendarEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: number;

  @Column({ type: 'varchar', nullable: true, default: null })
  googleId!: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  outlookId!: string;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn()
  owner!: User;

  @Column({ type: 'varchar', nullable: true })
  creator: string;

  @Column({ type: 'varchar', nullable: true })
  creatorFromGoogle: string;

  @Column({ type: 'varchar', nullable: true })
  creatorFromOutlook: string;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  meetLink: string;

  @CreateDateColumn({ nullable: true, precision: 3 })
  start!: Date;

  @CreateDateColumn({ nullable: true, precision: 3 })
  end!: Date;

  @CreateDateColumn()
  createdOn!: Date;

  @UpdateDateColumn()
  updatedOn!: Date;

  @Column({
    type: 'enum',
    enum: EventTypeEnum,
    nullable: false,
  })
  eventType!: EventTypeEnum;
}
