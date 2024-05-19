import {Component, OnInit} from '@angular/core';
import {first} from "rxjs/operators";
import {CalendarPermissionService} from "../../services/calendar/permission.service";
import {CalendarPermission} from "../../interfaces/calendar/permission.calendar.inteface";

export enum CalendarType {
  GOOGLE = "googleCalendar",
  MS = "office365Calendar",
  POPUP_NAME = 'calendar-access'
}

@Component({
  selector: 'app-connect-calendar',
  templateUrl: './connect-calendar.component.html',
  styleUrls: ['./connect-calendar.component.scss']
})
export class ConnectCalendarComponent implements OnInit {

  googleCalendar: any = null
  msCalendar: any = null
  error: any | null = null;

  constructor(private calendarPermissionService: CalendarPermissionService) {
  }

  ngOnInit(): void {
    this.fetchCurrentCalendar();
  }

  fetchCurrentCalendar() {
    this.calendarPermissionService.fetch()
      .pipe(first())
      .subscribe({
        next: (value: CalendarPermission | any) => {
          this.googleCalendar = value.googleCalendar
          this.msCalendar = value.office365Calendar
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  accessGoogleCalendar(checked: boolean) {
    this.calendarPermissionService.googleCalendarAccess(checked).subscribe();
  }

  accessMsCalendar(checked: boolean) {
    this.calendarPermissionService.msCalendarAccess(checked).subscribe();
  }

  hasCalendarPermission(type: CalendarType): boolean {
    if (this.googleCalendar != null) {
      if (type === CalendarType.GOOGLE) {
        return this.googleCalendar === true;
      } else if (type === CalendarType.MS) {
        return this.msCalendar === true;
      }
    }
    return false
  }

  get CalendarType(): typeof CalendarType {
    return CalendarType;
  }
}
