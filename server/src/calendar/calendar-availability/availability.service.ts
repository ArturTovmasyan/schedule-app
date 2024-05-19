import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import {BadRequestException, HttpStatus, Injectable} from '@nestjs/common';
import {ErrorMessages} from '../../components/constants/error.messages';
import {CreateAvailabilityDto} from './dto/create-availability.dto';
import {UpdateAvailabilityDto} from './dto/update-availability.dto';
import {Availability} from './entities/availability.entity';
import {User} from '@user/entity/user.entity';
import {IResponse, IResponseMessage} from 'src/components/interfaces/response.interface';
import {ClockType} from "./enums/clockType.enum";

const moment = require('moment');
require('moment-weekday-calc');

@Injectable()
export class AvailabilityService {
    constructor(
        @InjectRepository(Availability)
        private readonly availabilityRepo: Repository<Availability>,
    ) {
    }

    /**
     * @description `Create Availability for authorized user`
     *
     * @param user - `Authorized user data`
     * @param createAvailabilityDto - `Availability dto data`
     *
     * @returns `{Created Availability data}`
     */

    async create(
        user: User,
        createAvailabilityDto: CreateAvailabilityDto,
    ): Promise<IResponse<Availability>> {
        const checkUser = await this.availabilityRepo.findOne({
            where: {user: {id: user.id}},
        });

        if (checkUser) {
            throw new BadRequestException({
                message: ErrorMessages.availabilityExists,
            });
        }

        const data = await this.availabilityRepo.save({
            user: {id: user.id},
            ...createAvailabilityDto,
        });

        return {data};
    }

    /**
     * @description `Find calendar-availability of user`
     * @param userId - `Authorized user data`
     * @param convert - `Convert data ?`
     * @returns `{calendar-availability entity data(Object)}`
     */

    async findOne(userId: string, convert: boolean = false): Promise<any> {
        let data: Availability = await this.availabilityRepo.findOne({
            user: {id: userId},
        });

        if (convert) {
            const availabilityDates:any[] = await this.convertAvailabilityToDate(data);
            // const contactEvents:any[] = await this.eventService.getEventsByUserIds([userId]);
            return {availabilityDates};
        }

        return {data};
    }

    /**
     * @description `Update user Availability data`
     *
     * @param user - `Authorized user data`
     * @param updateAvailabilityDto - `optional create Availability dto data`
     *
     * @returns `{updated}`
     */

    async update(
        user: User,
        updateAvailabilityDto: UpdateAvailabilityDto,
    ): Promise<IResponseMessage> {
        await this.availabilityRepo.update(
            {
                user: {id: user.id},
            },
            {...updateAvailabilityDto},
        );

        return {message: 'updated', status: HttpStatus.ACCEPTED};
    }

    remove(id: number) {
        return `Method not implemented`;
    }

    /**
     * @description `Convert user Availability data to event dates`
     *
     * @returns `{updated}`
     * @param data
     */
    async convertAvailabilityToDate(data: Availability): Promise<any[]> {
        const dates = [];

        const dateRange = moment().dateRangeToDates({
            rangeStart: moment().toDate(),
            rangeEnd: moment().add(2, 'week').format('yyyy-MM-DD'),//TODO get from time_for_access
            weekdays: this.generateWeekDays(data)
        });

        dateRange.forEach((date) => {
            let dateStart;
            let dateEnd;
            let timeFrom:number = +data.from.split(':')[0];
            let timeTo:number = +data.to.split(':')[0];

            if (data.clockType == ClockType.H12) {
                 dateStart = date.set({ hour:timeFrom }).toDate();
                 let formatHour = moment(timeTo+" PM", ["h:mm A"]).format("HH:mm");
                 formatHour = formatHour.split(':')[0];
                 dateEnd = date.set({ hour:formatHour }).toDate();
            } else {
                dateStart = date.set({ hour:timeFrom }).toDate();
                dateEnd = date.set({ hour:timeTo }).toDate();
            }

            dates.push({
                start: dateStart,
                end: dateEnd,
            });
        });

        return dates;
    }

    generateWeekDays(data: Availability) {
        const weekDays = [];

        if (data.monday) {
            weekDays.push(1);
        }

        if (data.tuesday) {
            weekDays.push(2);
        }

        if (data.wednesday) {
            weekDays.push(3);
        }

        if (data.thursday) {
            weekDays.push(4);
        }

        if (data.friday) {
            weekDays.push(5);
        }

        if (data.saturday) {
            weekDays.push(6);
        }

        if (data.sunday) {
            weekDays.push(7);
        }

        return weekDays;
    }
}


