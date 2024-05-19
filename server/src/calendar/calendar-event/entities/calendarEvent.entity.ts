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
import { Calendar } from './calendar.entity';
import { EventRecurrenceTypeEnum } from '../enums/eventRecurrenceType.enum';
import { WeekDaysEnum } from '../enums/weekDays.enum';
import { IndexOfWeekEnum } from '../enums/indexOfWeek.enum';

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

  @ManyToOne(() => Calendar, (calendar) => calendar.id, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  calendar!: Calendar;

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
    nullable: true,
  })
  eventType!: EventTypeEnum;

  @Column({
    type: 'enum',
    enum: EventRecurrenceTypeEnum,
    nullable: false,
  })
  recurrenceType!: EventRecurrenceTypeEnum;

  @Column({ nullable: true })
  recurrenceInterval: number;

  @Column({
    type: 'enum',
    enum: WeekDaysEnum,
    array: true,
    nullable: true,
  })
  recurrenceDaysOfWeek;

  @Column({
    type: 'enum',
    enum: IndexOfWeekEnum,
    nullable: true,
  })
  recurrenceIndexOfWeek;

  @Column({
    nullable: true,
  })
  recurrenceDayOfMonth: number;

  @Column({ nullable: true })
  recurrenceMonth: number;

  @Column({ nullable: true })
  recurrenceFirstDayOfWeek: string;

  @CreateDateColumn({ nullable: true, default: null })
  recurrenceStartDate: Date;

  @CreateDateColumn({ nullable: true, default: null })
  recurrenceEndDate: Date;

  @Column({ nullable: true })
  recurrenceNumberOfOccurrences: number;
}
