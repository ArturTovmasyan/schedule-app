import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment-timezone';
import { first } from 'rxjs';
import { Calendar, CalendarData } from 'src/app/core/interfaces/calendar/calendar-data.interface';
import { CreateEventRequest } from 'src/app/core/interfaces/calendar/create-event-request.interface';
import { CalendarService } from 'src/app/core/services/calendar/calendar.service';
import { CalendarPermissionService } from 'src/app/core/services/calendar/permission.service';
import { CommonService } from 'src/app/core/services/common.service';
import { CalendarType } from '../connect-calendar/connect-calendar.component';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss']
})
export class MeetingComponent implements OnInit {

  data: CreateEventRequest = {
    title: "",
    description: "",
    meetLink: "",
    date: "",
    start: "",
    end: "",
    syncWith: "",
    attendees: [],
    optionalAttendees: []
  };
  myCalendar: CalendarData | null = null;
  selectedCalendar: Calendar | null = null;
  showCalendars = false;

  constructor(
    private readonly router: Router,
    private readonly calendarService: CalendarService,
    private readonly permissionService: CalendarPermissionService,
    private readonly commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.permissionService.fetchCalendars()
      .pipe(first())
      .subscribe({
        next: (data: CalendarData | any) => {
          this.myCalendar = data;
          if(this.myCalendars.length > 0) {
            this.selectCalendar(this.myCalendars[0]);
          }
        }
      });
    this.data.start = this.commonService.getFormattedDateString(moment()) ?? "";
    this.data.end = this.commonService.getFormattedDateString(moment().add(45, 'minutes')) ?? "";
  }

  get myCalendars() {
    const calendars: Calendar[] = []
    this.myCalendar?.googleCalendar?.forEach((item) => {
      calendars.push(item);
    });
    this.myCalendar?.office365Calendar?.forEach((item) => {
      calendars.push(item);
    });
    return calendars;
  }

  selectCalendar(calendar: Calendar) {
    this.data.syncWith = calendar.id;
    this.selectedCalendar = calendar;
    this.showCalendars = false;
  }

  getCalendarIcon(type: CalendarType | null): string {
    if(type === CalendarType.Office365Calendar) {
      return 'assets/outlook-icon.svg';
    } else {
      return 'assets/google-icon.svg';
    }
  }

  get parsedStartTime(): string {
    return this.commonService.getFormattedDateString(moment.utc(this.data.start).local(), 'hh:mmA') ?? "";
  }

  get parsedEndTime(): string {
    return this.commonService.getFormattedDateString(moment.utc(this.data.end).local(), 'hh:mmA') ?? "";
  }

  get parsedDate(): string {
    return this.commonService.getFormattedDateString(moment.utc(this.data.start).local(), 'ddd, MMM Do') ?? "";
  }

  get hasCalendars(): boolean {
    return (this.myCalendar?.googleCalendar?.length ?? 0)  > 0 || (this.myCalendar?.office365Calendar?.length ?? 0)  > 0
  }

  get timezone(): string {
    return this.commonService.localTimezone;
  }

  close() {
    this.router.navigate(['/calendar/contacts'])
  }

  updateAttendeeEmails(emails: string[]) {
    this.data.attendees = emails;
  }

  updateOptionalAttendeeEmails(emails: string[]) {
    this.data.optionalAttendees = emails;
  }

  scheduleEvent() {
    this.calendarService.scheduleEvent(this.data)
    .pipe(first())
    .subscribe({
      next: (data: any) => {
        this.resetData();
      }
    });
  }

  resetData() {
    this.data = {
      title: "",
      description: "",
      date: "",
      meetLink: "",
      start: "",
      end: "",
      syncWith: "",
      attendees: [],
      optionalAttendees: []
    }
  }
}
