import {In, Repository} from 'typeorm';
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

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

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
     * @description `Find user calendar availability times`
     * @param userIds
     * @param currentUserId - `Current user id`
     * @returns `{Event times data}`
     */

    async findUserAvailabilityTimes(userIds: any[], currentUserId: string): Promise<any> {
        let availabilityData;
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
        let availability:any = {
            from: '09:00am',
            to: '18:00pm',
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: true,
            clockType: ClockType.H24
        };
=======
>>>>>>> 8270847 (Fix bug in no valid attendes data - load avail. events)

        if (userIds.length > 0) {

            let availability:any = {
                from: '09:00am',
                to: '18:00pm',
                monday: true,
                tuesday: true,
                wednesday: true,
                thursday: true,
                friday: true,
                saturday: true,
                sunday: true,
                clockType: ClockType.H24
            };

            let availabilities: Availability[] = await this.availabilityRepo.find({where: {user: In(userIds)}});

            if (availabilities) {
                // for contact list click
                if (availabilities.length == 1) {
                    availability = availabilities[0];
                } else {
                    availabilities.map((data) => {
                        availability = this.generateAttendeesAvailability(availability, data);

                        let startFrom = moment(availability.from, 'h:mma');
                        let endFrom = moment(data.from, 'h:mma');
                        let startTo = moment(data.to, 'h:mma');
                        let endTo = moment(availability.to, 'h:mma');

                        if (startFrom.isBefore(endFrom)) {
                            availability.from = data.from;
                        }

                        if (startTo.isBefore(endTo)) {
                            availability.to = data.to;
                        }
                    });
                }

                const startDate = moment().subtract(1, 'day').format('yyyy-MM-DD hh:mm:ss')
                const dateEnd = moment().add(1, 'month').format('yyyy-MM-DD hh:mm:ss');

                const eventUserIds = [...userIds, currentUserId];
                const contactEvents: any[] = await this.eventService.getEventsByUserIds(eventUserIds, {startDate, dateEnd});
                availabilityData = await this.convertAvailabilityToDate(availability, contactEvents);
            }
<<<<<<< HEAD

            const startDate = moment().subtract(1, 'day').format('yyyy-MM-DD hh:mm:ss')
            const dateEnd = moment().add(1, 'month').format('yyyy-MM-DD hh:mm:ss');

            const eventUserIds = [...userIds, currentUserId];
            const contactEvents: any[] = await this.eventService.getEventsByUserIds(eventUserIds, {startDate, dateEnd});
            availabilityData = await this.convertAvailabilityToDate(availability, contactEvents);
>>>>>>> 8af85e7 (Finish caklendar availability functionality)
=======
>>>>>>> 8270847 (Fix bug in no valid attendes data - load avail. events)
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

<<<<<<< HEAD
            dates.push({
                start: dateStart,
                end: dateEnd,
            });
=======
            for (let i = 0; i < contactEvents.length; i++) {
                const eventDate = contactEvents[i];
                let eventDateStart = eventDate.start;
                let eventDateEnd = eventDate.end;
                let newAvailabilityDate = [];

                if (eventDateStart.getDate() == availabilityStart.getDate()) {

                    eventData = this.initEventService.iniEvents(
                        dates,
                        splitEvents,
                        newAvailabilityDate,
                        eventDateStart,
                        eventDateEnd,
                        availabilityStart,
                        availabilityEnd);

                    dates = eventData.dates;
                }

                if (eventDateStart.getDate() == availabilityStart.getDate() ||
                    eventDateEnd.getDate() == availabilityStart.getDate()) {
                    notEventSplit = false;
                }
            }

            if (notEventSplit) {
                dates.push({
                    start: availabilityStart,
                    end: availabilityEnd
                });
            }
>>>>>>> 8af85e7 (Finish caklendar availability functionality)
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

    /**
     * @description `Generate availability data for attendees`
     *
     * @returns `{weekDays}`
     * @param availability
     * @param data
     */
    async generateAttendeesAvailability(availability: Availability, data: Availability): Promise<any> {
        if (!data.monday) {
            availability.monday = false;
        }

        if (!data.tuesday) {
            availability.tuesday = false;
        }

        if (!data.wednesday) {
            availability.wednesday = false;
        }

        if (!data.thursday) {
            availability.thursday = false;
        }

        if (!data.friday) {
            availability.friday = false;
        }

        if (!data.saturday) {
            availability.saturday = false;
        }

        if (!data.sunday) {
            availability.sunday = false;
        }

        return availability;
    }

    async findIdsByEmails(emails:string[], currentUserId: string):Promise<any> {
        let contactIds = await this.userRepo
            .createQueryBuilder('user')
            .select('user.id')
            .where({ email: In(emails) })
            .getMany();

        let ids = contactIds.map((item) => {
            return item.id;
        });

       return await this.findUserAvailabilityTimes(ids, currentUserId);
    }
}


