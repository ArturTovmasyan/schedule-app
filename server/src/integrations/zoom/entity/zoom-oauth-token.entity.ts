import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@user/entity/user.entity';

@Entity({ name: 'zoom_oauth_token' })
export class ZoomOAuthToken {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn()
  user: User;

  @Column({ type: 'varchar', nullable: false })
  accessToken: string;

  @Column({ type: 'varchar', nullable: true })
  refreshToken: string;

  @CreateDateColumn()
  createdOn: Date;

  @UpdateDateColumn()
  updatedOn: Date;

  @CreateDateColumn({ nullable: false, precision: 3 })
  expiryDate!: Date;
}
