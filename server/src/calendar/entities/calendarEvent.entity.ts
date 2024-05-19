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
import { CalendarTypeEnum } from '../../components/enums/calendarType.enum';

@Entity()
export class CalendarEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: number;

  @Column({ type: 'varchar', nullable: false })
  eventId!: string;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn()
  owner!: User;

  @Column({ type: 'varchar', nullable: true })
  creator: string;

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
    enum: CalendarTypeEnum,
    nullable: false,
  })
  calendarType!: CalendarTypeEnum;
}
