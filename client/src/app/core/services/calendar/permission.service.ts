import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../interfaces/response/api.response.interface';
import {CalendarPermission} from "../../interfaces/calendar/permission.calendar.inteface";

@Injectable({
  providedIn: 'root'
})
export class CalendarPermissionService {

  constructor(
    private readonly http: HttpClient,
  ) {
  }

  get url(): string {
    return '/api/calendar-permissions/';
  }

  fetch() {
    return this.http.get<ApiResponse<CalendarPermission>>(this.url+'status-of-calendars', {
    }).pipe(
      map((response: ApiResponse<CalendarPermission>) => {
        debugger;
        return response;
      })
    )
  }

  redirectAuth() {
    return this.http.get<any>(this.url+'google-calendar', {}).pipe(
      map((response: any) => {
        debugger;
        return true
      })
    )
  }

  redirectGoogleCallback(code: string) {
    return this.http.get<any>(this.url+'google-calendar-callback?code='+code, {}).pipe(
      map((response: any) => {
        debugger;
        return true
      })
    )
  }
}
