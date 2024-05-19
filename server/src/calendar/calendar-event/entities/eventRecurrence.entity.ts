import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EventRecurrenceTypeEnum } from '../enums/eventRecurrenceType.enum';
import { WeekDaysEnum } from '../enums/weekDays.enum';
import { IndexOfWeekEnum } from '../enums/indexOfWeek.enum';

@Entity()
export class EventRecurrence {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: EventRecurrenceTypeEnum,
    nullable: false,
  })
  type!: EventRecurrenceTypeEnum;

  @Column({ nullable: true })
  interval: number;

  @Column({
    type: 'enum',
    enum: WeekDaysEnum,
    array: true,
    nullable: true,
  })
  daysOfWeek;

  @Column({
    type: 'enum',
    enum: IndexOfWeekEnum,
    nullable: true,
  })
  indexOfWeek;

  @Column({
    nullable: true,
  })
  dayOfMonth: number;

  @Column({ nullable: true })
  month: number;

  @Column({ nullable: true })
  firstDayOfWeek: string;

  @CreateDateColumn({ nullable: true })
  startDate: Date;

  @CreateDateColumn({ nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  numberOfOccurrences: number;
}
