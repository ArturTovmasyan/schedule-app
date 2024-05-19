import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@user/entity/user.entity';
import { CalendarTypeEnum } from '../../calendar-permissions/enums/calendarType.enum';
import { Calendar } from './calendar.entity';

@Entity()
export class CalendarWebhookChannel {
  @PrimaryGeneratedColumn('uuid')
  id!: number;

  @Column({ type: 'varchar', nullable: true, default: null })
  channelId!: string;

  @OneToOne(() => Calendar, (calendar) => calendar.id, { nullable: false })
  @JoinColumn()
  calendar!: Calendar;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn()
  owner!: User;

  @CreateDateColumn({ nullable: true, precision: 3 })
  expirationDate!: Date;

  @CreateDateColumn()
  createdOn!: Date;

  @UpdateDateColumn()
  updatedOn!: Date;

  @Column({
    type: 'enum',
    enum: CalendarTypeEnum,
    nullable: false,
  })
  calendarType!: CalendarTypeEnum;
}
