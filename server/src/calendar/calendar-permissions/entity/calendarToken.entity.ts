import {
  Column,
  Unique,
  Entity,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@user/entity/user.entity';
import { CalendarTypeEnum } from '../enums/calendarType.enum';

@Entity()
export class CalendarToken {
  @PrimaryGeneratedColumn('uuid')
  id!: number;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn()
  owner!: User;

  @Column({ type: 'varchar', nullable: false })
  accessToken!: string;

  @Column({ type: 'varchar', nullable: true })
  refreshToken!: string;

  @Column({ type: 'varchar', nullable: true, name: 'owner_email' })
  ownerEmail: string;

  @CreateDateColumn()
  createdOn!: Date;

  @UpdateDateColumn()
  updatedOn!: Date;

  @CreateDateColumn({ nullable: false, precision: 3 })
  expiryDate!: Date;

  @CreateDateColumn({ nullable: true, precision: 3 })
  extExpiryDate!: Date;

  @Column({
    type: 'enum',
    enum: CalendarTypeEnum,
    nullable: false,
  })
  calendarType!: CalendarTypeEnum;
}
