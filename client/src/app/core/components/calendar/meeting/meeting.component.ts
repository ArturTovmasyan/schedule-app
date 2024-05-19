import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment-timezone';
import { first } from 'rxjs';
import { CalendarData } from 'src/app/core/interfaces/calendar/calendar-data.interface';
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
    start: "",
    end: "",
    syncWith: CalendarType.GoogleCalendar,
    attendees: [],
    optionalAttendees: []
  };
  myCalendars: CalendarData | null = null;

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
          this.myCalendars = data;
        }
      });
    this.data.start = this.commonService.getFormattedDateString(moment()) ?? "";
    this.data.end = this.commonService.getFormattedDateString(moment().add(45, 'minutes')) ?? "";
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
    return (this.myCalendars?.googleCalendar?.length ?? 0)  > 0 || (this.myCalendars?.office365Calendar?.length ?? 0)  > 0
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
    console.log(this.data)
    // this.calendarService.scheduleEvent(this.data)
    // .pipe(first())
    // .subscribe({
    //   next: (data: any) => {
    //     console.log(data)
    //     this.resetData();
    //   }
    // });
  }

  resetData() {
    this.data = {
      title: "",
      description: "",
      meetLink: "",
      start: "",
      end: "",
      syncWith: CalendarType.GoogleCalendar,
      attendees: [],
      optionalAttendees: []
    }
  }
}
