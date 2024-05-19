import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {EntityManager, Repository} from "typeorm";
import {CalendarToken} from "./entity/calendarToken.entity";
import {TokensByCalendar} from "./types/statusOfCalendars.type";
import {ConfigService} from "@nestjs/config";
import {Auth, google} from 'googleapis';
import {transactionManagerWrapper} from "../helpers/dbTransactionManager";
import {CalendarTypeEnum} from "./enums/calendarType.enum";
import {UserDto} from "@user/dto/user.dto";


@Injectable()
export class CalendarPermissionsService {
    oauthClient: Auth.OAuth2Client;

    constructor(
        @InjectRepository(CalendarToken)
        private readonly calendarTokenRepository: Repository<CalendarToken>,
        private readonly configService: ConfigService,
    ) {
        const clientID = this.configService.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
        const clientURL = this.configService.get<string>('GOOGLE_CALENDAR_CALLBACK_URL');
        this.oauthClient = new google.auth.OAuth2(clientID, clientSecret, clientURL,);
    }

    async toggleGoogleCalendar(user: UserDto) {
        const statusOfCalendarsAndUrl: {
            url: null | string,
            statusOfCalendars: null | object
        } = {
            url: null,
            statusOfCalendars: null
        }

        const existingTokens = await this.calendarTokenRepository.findOne(
            {
                where: {
                    owner: user.id,
                    calendarType: CalendarTypeEnum.GoogleCalendar
                }
            })

        if (existingTokens?.accessToken) {
            const resRevokeToken = await this.oauthClient.revokeToken(existingTokens.accessToken)
            if (resRevokeToken.status === 200) {
                await this.calendarTokenRepository.delete({
                    owner: {id: user.id},
                    calendarType: CalendarTypeEnum.GoogleCalendar
                })
            }

            const statusOfCalendars = await this.getUserStatusOfCalendars(user.id);

            statusOfCalendarsAndUrl.statusOfCalendars = statusOfCalendars;

            return statusOfCalendarsAndUrl
        }

        const url = this.oauthClient.generateAuthUrl({
            access_type: 'offline',
            scope: ['openid', 'profile', 'email', 'https://www.googleapis.com/auth/calendar']
        });

        statusOfCalendarsAndUrl.url = url;
        return statusOfCalendarsAndUrl;
    }

    async getTokensAndSave(user: UserDto, code: string) {
        return this.calendarTokenRepository.manager.transaction(async manager => {
            const calendarTokenRepository = manager.getRepository(CalendarToken);
            const {tokens} = await this.oauthClient.getToken(code)

            const calendarTokenBody = {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiryDate: tokens.expiry_date,
                calendarType: CalendarTypeEnum.GoogleCalendar,
                owner: {id: user.id}
            };

            await calendarTokenRepository.save(calendarTokenBody);

            return this.getUserStatusOfCalendars(user.id, manager);
        });
    }

    async getUserStatusOfCalendars(userId: string, manager?: EntityManager) {
        return transactionManagerWrapper(
            manager,
            this.calendarTokenRepository,
            async manager => {
                const tokensByCalendar: TokensByCalendar = {
                    googleCalendar: false,
                    office365Calendar: false,
                    exchangeCalendar: false,
                    outlookPlugIn: false,
                    iCloudCalendar: false,
                }

                const calendarTokens = await manager.getRepository(CalendarToken).find(
                    {where: {owner: userId}}
                );
                calendarTokens.forEach((item) => {
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
            },
        );
    }
}
