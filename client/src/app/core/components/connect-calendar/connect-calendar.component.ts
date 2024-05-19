import { Component, OnInit } from '@angular/core';
import {first} from "rxjs/operators";
import {CalendarPermissionService} from "../../services/calendar/permission.service";
import {CalendarPermission} from "../../interfaces/calendar/permission.calendar.inteface";

enum CalendarType { //TODO sync with backend interface
  GOOGLE = "google",
  MS = "ms",
  APPLE = "apple"
}

@Component({
  selector: 'app-connect-calendar',
  templateUrl: './connect-calendar.component.html',
  styleUrls: ['./connect-calendar.component.scss']
})
export class ConnectCalendarComponent implements OnInit {

  currentCalendar: any = null
  error: any | null = null;

  constructor(private calendarPermissionService: CalendarPermissionService) { }

  ngOnInit(): void {
    this.fetchCurrentCalendar();
  }

  fetchCurrentCalendar() {
    this.calendarPermissionService.fetch()
      .pipe(first())
      .subscribe({
        next: (value: CalendarPermission|any) => {
          debugger;
          this.currentCalendar = value.googleCalendar
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  accessGoogleCalendar() {
      this.calendarPermissionService.redirectAuth()
        .pipe(first())
        .subscribe({
          next: (value: any) => {
            debugger;
          },
          error: (error) => {
            debugger;
          }
        });
  }

  hasGoogleCalendarPermission(): boolean {
    debugger;
    if (this.currentCalendar != null) {
      return this.currentCalendar === true;
    }
    return false
  }

  get CalendarType(): typeof CalendarType {
    return CalendarType;
  }
}
