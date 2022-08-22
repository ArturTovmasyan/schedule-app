import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CalendarToken} from "./entity/calendarToken.entity";
import {TokensByCalendar} from "./types/statusOfCalendars.type";
import {ConfigService} from "@nestjs/config";
import {Auth, google} from 'googleapis';


@Injectable()
export class CalendarPermissionsService {
    oauthClient: Auth.OAuth2Client;

    constructor(
        @InjectRepository(CalendarToken)
        private readonly calendarTokenRepo: Repository<CalendarToken>,
        private readonly configService: ConfigService,
    ) {
        const clientID = this.configService.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
        const clientURL = this.configService.get<string>('GOOGLE_CALENDAR_CALLBACK_URL');
        this.oauthClient = new google.auth.OAuth2(clientID, clientSecret, clientURL,);
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

    async connectGoogleCalendar() {
        return this.oauthClient.generateAuthUrl({
            access_type: 'offline',
            scope: ['openid', 'profile', 'email', 'https://www.googleapis.com/auth/calendar']
        });
    }
}
