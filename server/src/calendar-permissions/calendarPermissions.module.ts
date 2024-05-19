import {Module} from '@nestjs/common';
import {CalendarPermissionsController} from './calendarPermissions.controller';
import {CalendarPermissionsService} from './calendarPermissions.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {CalendarToken} from "./entity/calendarToken.entity";
import {PassportModule} from "@nestjs/passport";

@Module({
    imports: [
        TypeOrmModule.forFeature([CalendarToken]),
        PassportModule.register({defaultStrategy: 'jwt'}),
    ],
    controllers: [CalendarPermissionsController],
    providers: [CalendarPermissionsService]
})
export class CalendarPermissionsModule {
}
