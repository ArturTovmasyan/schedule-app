import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {User} from "@user/entity/user.entity";
import {CalendarTypeEnum} from "../enums/calendarType.enum";

@Entity()
export class CalendarPermission {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.id, {nullable: false})
    @JoinColumn()
    owner!: User;

    @Column({type: 'varchar', nullable: false})
    accessToken!: string;

    @Column({type: 'varchar', nullable: false})
    refreshToken!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @CreateDateColumn({precision: 3})
    expiryDate!: Date;

    @Column({
        type: 'enum',
        enum: CalendarTypeEnum,
        nullable: false,
    })
    calendarType!: CalendarTypeEnum;
}
