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
import {CalendarEventService} from "../calendar-event/calendar-event.service";
import {CalendarEvent} from "../calendar-event/entities/calendarEvent.entity";
import TimeIntervalDto from "../calendar-event/dto/timeInterval.dto";

const moment = require('moment');
require('moment-weekday-calc');

@Injectable()
export class AvailabilityService {
    constructor(
        @InjectRepository(Availability)
        private readonly availabilityRepo: Repository<Availability>,
        private readonly eventService: CalendarEventService,
        private readonly initEventService: InitEventService,
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

        return {data};
    }

    /**
     * @description `Find user calendar aval. times`
     * @param userId
     * @param currentUserId - `Current user id`
     * @returns `{Event times data}`
     */

    async findUserAvailabilityTimes(userId: string, currentUserId: string): Promise<any> {
        let availabilityData;
        let data: Availability[] = await this.availabilityRepo.find({
            where: { user: In(userIds) },
        });

        if (data) {
            const weekDays = await this.generateWeekDays(data[0]);
            const startDate = moment().toDate();
            const dateEnd = moment().add(1, 'week').format('yyyy-MM-DD') //TODO get from time_for_access
            const contactEvents:any[] = await this.eventService.getEventsByUserIds(userIds, {startDate, dateEnd});
            availabilityDates = await this.convertAvailabilityToDate(data[0], contactEvents);
            availabilityDates.push(...contactEvents);
        }

        return {availabilityData};
    }

    async extractEmptyEventDates(availabilityDates, contactEvents) {
        debugger;
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
     * @returns `{dates}`
     * @param data
     * @param contactEvents
     */
    async convertAvailabilityToDate(data: Availability, contactEvents:any): Promise<any[]> {
        const dates = [];
        const contactEventDates = [];
        const weekDays = await this.generateWeekDays(data);

        // contactEvents.forEach((event) => {
        //     debugger;
        // });
        //
        const dateRange = moment().dateRangeToDates({
            rangeStart: moment().toDate(),
            rangeEnd: moment().add(2, 'week').format('yyyy-MM-DD hh:mm:ss'),
            weekdays: weekDays,
            exclusions: []
        });

        dateRange.forEach((date) => {
            let dateStart;
            let dateEnd;
            let hourFromSplit = data.from.split(':');
            let hourToSplit = data.to.split(':');

            let hourFrom: number = +hourFromSplit[0];
            let hourTo: number = +hourToSplit[0];

            let fromType = hourFromSplit[1].length > 2 ? hourFromSplit[1].slice(-2).toUpperCase() : '';
            let toType = hourToSplit[1].length > 2 ? hourToSplit[1].slice(-2).toUpperCase() : '';

            let minuteFrom: number = fromType ? +(hourFromSplit[1].slice(0, -2)) : +hourFromSplit[1];
            let minuteTo: number = toType ? +(hourToSplit[1].slice(0, -2)) : +hourToSplit[1];

            if (data.clockType == ClockType.H12) {
                let formatFromHour = moment(hourFrom + ' ' + fromType, ["h:mm A"]).format("HH:mm");
                let formatToHour = moment(hourTo + ' ' + toType, ["h:mm A"]).format("HH:mm");

                formatFromHour = formatFromHour.split(':')[0];
                dateStart = date.set({hour: formatFromHour, minute: minuteFrom}).toDate();
                formatToHour = formatToHour.split(':')[0];
                dateEnd = date.set({hour: formatToHour, minute: minuteTo}).toDate();
            } else {
                dateStart = date.set({hour: hourFrom, minute: minuteFrom}).toDate();
                dateEnd = date.set({hour: hourTo, minute: minuteTo}).toDate();
            }

            dates.push({
                start: dateStart,
                end: dateEnd,
            });
        });

        return dates;
    }

    async splitDatesByInterval(start: Date, end: Date, weekDays: [], interval:number): Promise<any>  {
        let dates = [];
        let count = 0;

        while (end >= start) {
            start = new Date(start.getTime() + (interval * 60 * 1000));
            let day = start.getDay();

            debugger;
            // @ts-ignore
            if (weekDays.includes(day)) {
                dates[count] = start;
                count++;
            }
        }

        return dates;
    }

    /**
     * @description `Generate week days array by user availability data`
     *
     * @returns `{weekDays}`
     * @param data
     */
    async generateWeekDays(data: Availability): Promise<any> {
        const weekDays = [];

        if (data.sunday) {
            weekDays.push(0);
        }

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

        return weekDays;
    }
}


