import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CalendarToken} from "./entity/calendarToken.entity";
import {TokensByCalendar} from "./types/statusOfCalendars.type";

@Injectable()
export class CalendarPermissionsService {
    constructor(
        @InjectRepository(CalendarToken)
        private readonly calendarTokenRepo: Repository<CalendarToken>,
    ) {
    }

    async getUserStatusOfCalendars(userId: string): Promise<TokensByCalendar> {

        const tokensByCalendar: TokensByCalendar = {
            googleCalendar: false,
            office365Calendar: false,
            exchangeCalendar: false,
            outlookPlugIn: false,
            iCloudCalendar: false,
        }

        const tokens = await this.calendarTokenRepo.find({where: {owner: userId}});

        tokens.forEach((item) => {
            switch (item.calendarType) {
                case 'GoogleCalendar':
                    tokensByCalendar.googleCalendar = true
                    break;
                case 'Office365Calendar':
                    tokensByCalendar.office365Calendar = true
                    break;
                case 'ExchangeCalendar':
                    tokensByCalendar.exchangeCalendar = true
                    break;
                case 'OutlookPlugIn':
                    tokensByCalendar.outlookPlugIn = true
                    break;
                case 'iCloudCalendar':
                    tokensByCalendar.iCloudCalendar = true
                    break;
            }
        })

        return tokensByCalendar;
    }
}
