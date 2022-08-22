import {Controller, Get, Query, Req, Res, UseGuards} from '@nestjs/common';
import {AuthGuard} from "@nestjs/passport";
import {User} from "@user/entity/user.entity";
import {CalendarPermissionsService} from "./calendarPermissions.service";
import {TokensByCalendar} from "./types/statusOfCalendars.type";
import {Response} from "express";

@Controller('calendar-permissions')
export class CalendarPermissionsController {
    constructor(private readonly calendarPermissionsService: CalendarPermissionsService) {
    }

    @Get('status-of-calendars')
    @UseGuards(AuthGuard())
    async getUserCalendarPermissions(@Req() req: { user: User }): Promise<TokensByCalendar> {
        return await this.calendarPermissionsService.getUserStatusOfCalendars(req.user.id);
    }

    @Get('google-calendar')
    // @UseGuards(AuthGuard())
    async googleCalendar(@Res() res: Response) {
        const url = await this.calendarPermissionsService.connectGoogleCalendar();
        return res.redirect(url)
    }

    @Get('google-calendar-callback')
    // @UseGuards(AuthGuard())
    async googleCalendarCallback(@Query() query: any) {
        console.log('query ', query)
    }
}