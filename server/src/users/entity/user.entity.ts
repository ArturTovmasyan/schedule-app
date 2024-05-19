import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', unique: true, nullable: false }) email: string;
  @Column({ type: 'varchar', nullable: false }) firstName: string;
  @Column({ type: 'varchar', nullable: false }) lastName: string;
  @Column({ type: 'varchar', nullable: false }) password: string;
  @Column({ type: 'smallint', nullable: true, default: 0 }) status: number;
  @CreateDateColumn() createdOn?: Date;
  @UpdateDateColumn() updatedOn?: Date;
  @DeleteDateColumn() deletedOn?: Date;

  @BeforeInsert()
  async _hashPassword?() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
