import {Module} from '@nestjs/common';
import {CalendarPermissionsController} from './calendarPermissions.controller';
import {CalendarPermissionsService} from './calendarPermissions.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {CalendarPermission} from "./entity/calendarPermission.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([CalendarPermission]),
    ],
    controllers: [CalendarPermissionsController],
    providers: [CalendarPermissionsService]
})
export class CalendarPermissionsModule {
}
