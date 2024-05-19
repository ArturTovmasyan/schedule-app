import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {first} from "rxjs/operators";
import { CalendarData } from 'src/app/core/interfaces/calendar/calendar-data.interface';
import {CalendarPermissionService} from "../../../services/calendar/permission.service";

export enum CalendarType {
  GoogleCalendar = 'GoogleCalendar',
  Office365Calendar = 'Office365Calendar',
  ExchangeCalendar = 'ExchangeCalendar',
  OutlookPlugIn = 'OutlookPlugIn',
  iCloudCalendar = 'iCloudCalendar',
  PopupName = 'calendar-access'
}

@Component({
  selector: 'app-connect-calendar',
  templateUrl: './connect-calendar.component.html',
  styleUrls: ['./connect-calendar.component.scss']
})
export class ConnectCalendarComponent implements OnInit {

  data: CalendarData = {
    googleCalendar: [],
    office365Calendar: []
  }
  error: any | null = null;

  constructor(
    private calendarPermissionService: CalendarPermissionService,
    private readonly router: Router
  ) {
  }

  ngOnInit(): void {
    this.fetchCurrentCalendar();
  }

  fetchCurrentCalendar() {
    this.calendarPermissionService.fetchCalendars()
      .pipe(first())
      .subscribe({
        next: (data: CalendarData | any) => {
          this.data = data;
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  addGoogleCalendar() {
    localStorage.setItem('calendar-redirect', window.location.pathname);
    this.calendarPermissionService.connectGoogleCalendar()
      .pipe(first())
      .subscribe({
        next: (url: string) => {
          window.location.href = url;
        }
      });
  }

  removeGoogleCalendar(calendarId: string) {
    this.calendarPermissionService.disconnectGoogleCalendar(calendarId)
      .pipe(first())
      .subscribe({
        next: () => {
          const temp = this.data.googleCalendar.filter((calendar) => {
            return calendarId != calendar.calendarId;
          });
          this.data.googleCalendar = temp;
        }
      });
  }

  addOffice365Calendar() {
    this.calendarPermissionService.connectOffice365Calendar()
      .pipe(first())
      .subscribe({
        next: (url: string) => {
          window.location.href = url;
        }
      });
  }

  removeOffice365Calendar(calendarId: string) {
    this.calendarPermissionService.disconnectOffice365Calendar(calendarId)
      .pipe(first())
      .subscribe({
        next: () => {
          const temp = this.data.office365Calendar.filter((calendar) => {
            return calendarId != calendar.calendarId;
          });
          this.data.office365Calendar = temp;
        }
      });
  }

  hasCalendarPermission(type: CalendarType): boolean {
    if (type === CalendarType.GoogleCalendar) {
      return this.data.googleCalendar.length !== 0;
    } else if (type === CalendarType.Office365Calendar) {
      return this.data.office365Calendar.length !== 0;
    }
    return false
  }

  get CalendarType(): typeof CalendarType {
    return CalendarType;
  }
}
