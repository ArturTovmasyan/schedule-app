import {Controller, Get, Req, UseGuards} from '@nestjs/common';
import {AuthGuard} from "@nestjs/passport";
import {User} from "@user/entity/user.entity";
import {CalendarPermissionsService} from "./calendarPermissions.service";
import {TokensByCalendar} from "./types/statusOfCalendars.type";

@Controller('calendar-permissions')
export class CalendarPermissionsController {
    constructor(private readonly calendarPermissionsService: CalendarPermissionsService) {
    }

    @Get('status-of-calendars')
    @UseGuards(AuthGuard())
    async getUserCalendarPermissions(@Req() req: { user: User }): Promise<TokensByCalendar> {
        return await this.calendarPermissionsService.getUserStatusOfCalendars(req.user.id);
    }
}