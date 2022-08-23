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

@Entity('availability')
export class Availability {
  @PrimaryGeneratedColumn('uuid') id: string;

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'from', type: 'timestamptz' })
  from: Date;

  @Column({ name: 'to', type: 'timestamptz' })
  to: Date;

  @Column({ name: 'sunday', type: 'boolean', default: false })
  sunday?: Boolean;

  @Column({ name: 'monday', type: 'boolean', default: false })
  monday?: Boolean;

  @Column({ name: 'tuesday', type: 'boolean', default: false })
  tuesday?: Boolean;

  @Column({ name: 'wednesday', type: 'boolean', default: false })
  wednesday?: Boolean;

  @Column({ name: 'thursday', type: 'boolean', default: false })
  thursday?: Boolean;

  @Column({ name: 'friday', type: 'boolean', default: false })
  friday?: Boolean;

  @Column({ name: 'saturday', type: 'boolean', default: false })
  saturday?: Boolean;

  @Column({ name: 'clock_type', enum: ClockType })
  clockType: ClockType;

  @CreateDateColumn()
  createdOn?: Date;

  @UpdateDateColumn() updatedOn?: Date;
  @DeleteDateColumn() deletedOn?: Date;
}
