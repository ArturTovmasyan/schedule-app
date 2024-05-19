import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@user/entity/user.entity';
import { CalendarTypeEnum } from '../../calendar-permissions/enums/calendarType.enum';
import { CalendarToken } from 'src/calendar/calendar-permissions/entity/calendarToken.entity';
import { CalendarEvent } from './calendarEvent.entity';

@Entity()
export class Calendar {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  calendarId!: string;

  @Column({ type: 'varchar', nullable: false })
  summary!: string;

  @Column({ type: 'boolean', nullable: false })
  isPrimary: boolean;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn()
  owner!: User;

  @OneToOne(() => CalendarToken, (token) => token.id, { nullable: false })
  @JoinColumn()
  calendarToken!: CalendarToken;

  @Column({
    type: 'enum',
    enum: CalendarTypeEnum,
    nullable: false,
  })
  calendarType!: CalendarTypeEnum;

  @OneToMany(() => CalendarEvent, (calendarEvent) => calendarEvent.calendar)
  calendarEvent: CalendarEvent[];

  @CreateDateColumn()
  createdOn!: Date;

  @UpdateDateColumn()
  updatedOn!: Date;
}
