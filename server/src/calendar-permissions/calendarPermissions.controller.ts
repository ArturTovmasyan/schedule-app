import {Controller, Get, Query, Req, Res, UseGuards} from '@nestjs/common';
import {AuthGuard} from "@nestjs/passport";
import {User} from "@user/entity/user.entity";
import {CalendarPermissionsService} from "./calendarPermissions.service";
import {TokensByCalendar} from "./types/statusOfCalendars.type";
import {Response} from "express";
import {UsersService} from "@user/users.service";

@Controller('calendar-permissions')
export class CalendarPermissionsController {
    constructor(private readonly calendarPermissionsService: CalendarPermissionsService,
                private readonly usersService: UsersService) {
    }

    @Get('status-of-calendars')
    @UseGuards(AuthGuard())
    async getUserCalendarPermissions(@Req() req: { user: User }): Promise<TokensByCalendar> {
        return await this.calendarPermissionsService.getUserStatusOfCalendars(req.user.id);
    }

    @Get('google-calendar')
    @UseGuards(AuthGuard())
    async googleCalendar(@Req() req: { user: User }, @Res() res: Response) {
        const {url, statusOfCalendars} = await this.calendarPermissionsService.toggleGoogleCalendar(req.user);
        if (url) {
            return res.redirect(url)
        }
        return res.send(statusOfCalendars);
    }

    @Get('google-calendar-callback')
    @UseGuards(AuthGuard())
    async googleCalendarCallback(@Req() req: { user: User }, @Query() query: any) {
        return await this.calendarPermissionsService.getTokensAndSave(req.user, query.code);
    }
}