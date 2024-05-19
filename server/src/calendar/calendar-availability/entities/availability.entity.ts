import {
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@user/entity/user.entity';
import { ClockType } from '../enums/clockType.enum';
import { number } from 'joi';

@Entity('calendar_availability')
export class Availability {
  @PrimaryGeneratedColumn('uuid') id: string;

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'from', type: 'varchar', length: 7, nullable: false })
  from: string;

  @Column({ name: 'to', type: 'varchar', length: 7, nullable: false })
  to: string;

  @Column({
    name: 'timezone',
    type: 'varchar',
    length: 100,
    nullable: false,
    default: 'UTC',
  })
  timezone: string;

  @Column({ name: 'sunday', type: 'boolean', default: false })
  sunday?: boolean;

  @Column({ name: 'monday', type: 'boolean', default: false })
  monday?: boolean;

  @Column({ name: 'tuesday', type: 'boolean', default: false })
  tuesday?: boolean;

  @Column({ name: 'wednesday', type: 'boolean', default: false })
  wednesday?: boolean;

  @Column({ name: 'thursday', type: 'boolean', default: false })
  thursday?: boolean;

  @Column({ name: 'friday', type: 'boolean', default: false })
  friday?: boolean;

  @Column({ name: 'saturday', type: 'boolean', default: false })
  saturday?: boolean;

  @Column({ name: 'clock_type', enum: ClockType })
  clockType: ClockType;

  @CreateDateColumn()
  createdOn?: Date;

  @UpdateDateColumn() updatedOn?: Date;
  @DeleteDateColumn() deletedOn?: Date;
}
