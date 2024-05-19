import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import {User} from "@user/entity/user.entity";
import {CalendarTypeEnum} from "../enums/calendarType.enum";

@Entity()
@Unique(['calendarType', 'owner'])
export class CalendarToken {
    @PrimaryGeneratedColumn('uuid')
    id!: number;

    @ManyToOne(() => User, user => user.id, {nullable: false})
    @JoinColumn()
    owner!: User;

    @Column({type: 'varchar', nullable: false})
    accessToken!: string;

    @Column({type: 'varchar', nullable: true})
    refreshToken!: string;

    @CreateDateColumn()
    createdOn!: Date;

    @UpdateDateColumn()
    updatedOn!: Date;

    @Column({type: "bigint", nullable: false})
    expiryDate!: number;

    @Column({
        type: 'enum',
        enum: CalendarTypeEnum,
        nullable: false,
    })
    calendarType!: CalendarTypeEnum;
}
