import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import * as moment from 'moment-timezone';
import {BehaviorSubject, first} from 'rxjs';
import {Calendar, CalendarData} from 'src/app/core/interfaces/calendar/calendar-data.interface';
import {CreateEventRequest} from 'src/app/core/interfaces/calendar/create-event-request.interface';
import {CalendarService} from 'src/app/core/services/calendar/calendar.service';
import {CalendarPermissionService} from 'src/app/core/services/calendar/permission.service';
import {CommonService} from 'src/app/core/services/common.service';
import {CalendarType} from '../connect-calendar/connect-calendar.component';
import {AvailabilityService} from "../../../services/calendar/availability.service";
import {BroadcasterService} from "../../../../shared/services";

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss']
})
export class MeetingComponent implements OnInit, OnDestroy {

  data: CreateEventRequest = {
    title: "",
    description: "",
    meetLink: "",
    start: "",
    end: "",
    syncWith: "",
    attendees: [],
    optionalAttendees: []
  };
  myCalendar: CalendarData | null = null;
  selectedCalendar: Calendar | null = null;
  showCalendars = false;
  subscription: BehaviorSubject<boolean>;

  constructor(
    private readonly router: Router,
    private readonly calendarService: CalendarService,
    private readonly permissionService: CalendarPermissionService,
    private readonly commonService: CommonService,
    private readonly availabilityService: AvailabilityService,
    private readonly broadcaster: BroadcasterService
  ) {
    this.subscription = this.broadcaster.on('meet_date_range').subscribe((eventData: any) => {
      if (eventData.contact_email) {
        this.data.attendees = [eventData.contact_email];
      }

      this.data.start = eventData.start;
      this.data.end = eventData.end;
    });
  }

  ngOnInit(): void {
    this.permissionService.fetchCalendars()
      .pipe(first())
      .subscribe({
        next: (data: CalendarData | any) => {
          this.myCalendar = data;
          if (this.myCalendars.length > 0) {
            this.selectCalendar(this.myCalendars[0]);
          }
        }
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
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
    if (type === CalendarType.Office365Calendar) {
      return 'assets/outlook-icon.svg';
    } else {
      return 'assets/google-icon.svg';
    }
  }

  parsedStartTime(startDate: string): string {
    if (startDate) {
      return this.commonService.getFormattedDateString(moment.utc(startDate).local(), 'hh:mmA') ?? "";
    }

    return "";
  }

  parsedEndTime(endDate: string): string {
    if (endDate) {
      return this.commonService.getFormattedDateString(moment.utc(endDate).local(), 'hh:mmA') ?? "";
    }
    return "";
  }

  get parsedDate(): string {
    let currentDate = this.commonService.getFormattedDateString(moment()) ?? "";
    if (this.data.start) {
      currentDate = this.data.start;
    }
    return this.commonService.getFormattedDateString(moment.utc(currentDate).local(), 'ddd, MMM Do') ?? "";
  }

  get hasCalendars(): boolean {
    return (this.myCalendar?.googleCalendar?.length ?? 0) > 0 || (this.myCalendar?.office365Calendar?.length ?? 0) > 0
  }

  get timezone(): string {
    return this.commonService.localTimezone;
  }

  close() {
    this.router.navigate(['/calendar/contacts'])
  }

  updateAttendeeEmails(emails: string[]) {
    this.data.attendees = emails;
    this.getContactsAvailability();
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
      meetLink: "",
      start: "",
      end: "",
      syncWith: "",
      attendees: [],
      optionalAttendees: []
    }
  }

  getContactsAvailability() {
    const contactEmails = this.data.attendees;
    if (contactEmails && contactEmails.length > 0) {
      this.availabilityService.getByEmails(contactEmails)
        .pipe(first())
        .subscribe({
          next: (data: any | null) => {
            const availabilityData = data?.availabilityData;
            const contactData = {
              ...availabilityData
            }
            this.broadcaster.broadcast('contact_calendar_data', contactData);
          },
          error: (error) => {
            console.error(error.message);
          }
        });
    } else {
      this.broadcaster.broadcast('contact_calendar_data', []);
    }
  }
}
