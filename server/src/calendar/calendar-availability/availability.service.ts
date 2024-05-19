import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { ErrorMessages } from '../../components/constants/error.messages';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { Availability } from './entities/availability.entity';
import { User } from '@user/entity/user.entity';
import {
    IResponse,
    IResponseMessage,
} from 'src/components/interfaces/response.interface';
import { ClockType } from './enums/clockType.enum';
import { CalendarEventService } from '../calendar-event/calendar-event.service';
import { InitEventService } from '../../components/services/init-event.service';
import { weekdays } from 'moment';
import { CalendarEvent } from '../calendar-event/entities/calendarEvent.entity';
import { Console } from 'console';

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
    ) {}

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
            where: { user: { id: user.id } },
        });

        if (checkUser) {
            throw new BadRequestException({
                message: ErrorMessages.availabilityExists,
            });
        }

        const data = await this.availabilityRepo.save({
            user: { id: user.id },
            ...createAvailabilityDto,
        });

        return { data };
    }

    /**
     * @description `Find calendar-availability of user`
     * @param userId - `Authorized user data`
     * @param convert - `Convert data ?`
     * @returns `{calendar-availability entity data(Object)}`
     */

    async findOne(userId: string, convert = false): Promise<any> {
        const data: Availability = await this.availabilityRepo.findOne({
            user: { id: userId },
        });

        return { data };
    }

    /**
     * @description `Find user calendar availability times`
     * @param userIds
     * @param currentUserId - `Current user id`
     * @returns `{Event times data}`
     */

    async findUserAvailabilityTimes(
        userIds: any[],
        currentUserId: string,
    ): Promise<any> {
        let availabilityData = [];

        if (userIds.length > 0) {
            let availability: Availability = await this.availabilityRepo.findOne({
                where: { user: currentUserId },
            });

            const availabilities: Availability[] = await this.availabilityRepo.find({
                where: { user: In([...userIds]) },
            });
            if (availabilities) {
                const currentFormat =
                    availability.clockType == ClockType.H24 ? 'HH:mm' : 'hh:mma';
                availabilities.forEach((data) => {
                    const dataFormat =
                        data.clockType == ClockType.H24 ? 'HH:mm' : 'hh:mma';
                    availability = this.calculateAvailableDays(availability, data);
                    const currentStart = moment(
                        availability.from,
                        currentFormat,
                        availability.timezone,
                    );
                    const currentEnd = moment(
                        availability.to,
                        currentFormat,
                        availability.timezone,
                    );
                    const start = moment(data.from, dataFormat, data.timezone);
                    const end = moment(data.to, dataFormat, data.timezone);

                    if (currentStart.isSameOrBefore(start)) {
                        availability.from = start.format(currentFormat);
                    }

                    if (end.isSameOrBefore(currentEnd)) {
                        availability.to = end.format(currentFormat);
                    }
                });

                const startDate = moment()
                    .subtract(1, 'day')
                    .format('yyyy-MM-DD hh:mm:ss');
                const dateEnd = moment().add(2, 'month').format('yyyy-MM-DD hh:mm:ss');

                const eventUserIds = [...userIds, currentUserId];
                const contactEvents: CalendarEvent[] =
                    await this.eventService.getEventsByUserIds(eventUserIds, {
                        startDate,
                        dateEnd,
                    });
                availabilityData = await this.convertAvailabilityToDate(
                    availability,
                    contactEvents,
                );
            }
        }

        return { availabilityData };
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
                user: { id: user.id },
            },
            { ...updateAvailabilityDto },
        );

        return { message: 'updated', status: HttpStatus.ACCEPTED };
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

    async convertAvailabilityToDate(
        availability: Availability,
        existingEvents: CalendarEvent[],
    ): Promise<any> {
        const dates = [];
        const weekDays = await this.generateWeekDays(availability);
        const availableDates: moment.Moment[] = moment().dateRangeToDates({
            rangeStart: moment().toDate(),
            rangeEnd: moment().add(4, 'week').format('yyyy-MM-DD hh:mm:ss'),
            weekdays: weekDays,
            exclusions: [],
        });
        const eventMap = new Map<string, CalendarEvent[]>();
        existingEvents.forEach((event) => {
            const key = `${event.start.getFullYear()}-${
                event.start.getMonth() + 1
            }-${event.start.getDate()}`;
            const data = eventMap.has(key) ? eventMap.get(key) : [];
            data.push(event);
            eventMap.set(key, data);
        });

        const timeFormat =
            availability.clockType == ClockType.H24 ? 'HH:mm' : 'hh:mma';

        availableDates.forEach((date) => {
            const key = `${date.year()}-${date.month() + 1}-${date.date()}`;
            const dateEvents = eventMap.has(key) ? eventMap.get(key) : [];
            let start = moment(
                availability.from,
                timeFormat,
                availability.timezone,
            ).set({
                month: date.month(),
                date: date.date(),
                second: 0,
            });
            // console.log(date, start);
            const end = moment(
                availability.to,
                timeFormat,
                availability.timezone,
            ).set({
                month: date.month(),
                date: date.date(),
                second: 0,
            });
            if (dateEvents.length > 0) {
                dateEvents.forEach((event) => {
                    const eventStart = moment(event.start);
                    const eventEnd = moment(event.end);
                    if (end.isAfter(start)) {
                        // consider only if event span is within availability
                        if (
                            (start.isSameOrBefore(eventStart) &&
                                eventStart.isSameOrBefore(end)) ||
                            (start.isSameOrBefore(eventEnd) && eventEnd.isSameOrBefore(end))
                        ) {
                            // event start before availability but end during availabity
                            if (
                                eventStart.isSameOrBefore(start) &&
                                start.isSameOrBefore(eventEnd)
                            ) {
                                start = eventEnd;
                            }
                                // if event start and ends during availability
                            // OR event start during availability and end after
                            else if (
                                (start.isSameOrBefore(eventStart) &&
                                    eventEnd.isSameOrBefore(end)) ||
                                (eventStart.isSameOrBefore(end) && end.isSameOrBefore(eventEnd))
                            ) {
                                dates.push({
                                    start: moment(date)
                                        .set({
                                            hour: start.hour(),
                                            minute: start.minute(),
                                            second: 0,
                                        })
                                        .toISOString(),
                                    end: moment(date)
                                        .set({
                                            hour: eventStart.hour(),
                                            minute: eventStart.minute(),
                                            second: 0,
                                        })
                                        .toISOString(),
                                });
                                start = eventEnd.isSameOrBefore(end) ? eventEnd : end;
                            }
                        } else if (end.isSameOrBefore(eventStart)) {
                            dates.push({
                                start: moment(date)
                                    .set({
                                        hour: start.hour(),
                                        minute: start.minute(),
                                        second: 0,
                                    })
                                    .toISOString(),
                                end: moment(date)
                                    .set({
                                        hour: end.hour(),
                                        minute: end.minute(),
                                        second: 0,
                                    })
                                    .toISOString(),
                            });
                        }
                    }
                });
            }
            if (end.isAfter(start)) {
                dates.push({
                    start: moment(date)
                        .set({
                            hour: start.hour(),
                            minute: start.minute(),
                            second: 0,
                        })
                        .toISOString(),
                    end: moment(date)
                        .set({
                            hour: end.hour(),
                            minute: end.minute(),
                            second: 0,
                        })
                        .toISOString(),
                });
            }
        });

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
    calculateAvailableDays(
        availability: Availability,
        data: Availability,
    ): Availability {
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

    async findIdsByEmails(emails: string[], currentUserId: string): Promise<any> {
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
