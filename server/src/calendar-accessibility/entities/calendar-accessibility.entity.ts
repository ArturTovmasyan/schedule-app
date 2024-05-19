import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@user/entity/user.entity';
import { AccessibilityTypeEnum } from '../enums/calendar-accessibility.enum';

@Entity('calendar_accessibility')
export class CalendarAccessibility {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'accessibility_type', enum: AccessibilityTypeEnum })
  accessibilityType: AccessibilityTypeEnum;

  @Column({ name: 'domains', type: 'jsonb' })
  domains: string[];

  @CreateDateColumn()
  createdOn?: Date;

  @UpdateDateColumn() updatedOn?: Date;
  @DeleteDateColumn() deletedOn?: Date;
}
