import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class EventRecurrenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: EventRecurrenceTypeEnum,
    nullable: false,
  })
  type!: EventRecurrenceTypeEnum;

  @Column()
  interval: number;

  @Column()
  firstDayOfWeek: string;

  @CreateDateColumn()
  startDate: Date;

  @CreateDateColumn()
  endDate: Date;

  @Column()
  numberOfOccurrences: number;
}
