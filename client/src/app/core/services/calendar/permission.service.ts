import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {map} from 'rxjs/operators';
import {ApiResponse} from '../../interfaces/response/api.response.interface';
import {CalendarPermission} from "../../interfaces/calendar/permission.calendar.inteface";
import {CalendarType} from "../../components/calendar/connect-calendar/connect-calendar.component";

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
    return this.http.get<ApiResponse<CalendarPermission>>(this.url + 'status-of-calendars', {}).pipe(
      map((response: ApiResponse<CalendarPermission>) => {
        return response;
      })
    )
  }

  googleCalendarAccess(checked: boolean) {
    return this.http.get<any>(this.url + 'google-calendar', {}).pipe(
      map((response: any) => {
        if (response.data && checked) {
          this.createCalendarAccessWindow(response.data.url);
        }
      })
    )
  }

  msCalendarAccess(checked: boolean) {
    return this.http.get<any>(this.url + 'ms-calendar', {}).pipe(
      map((response: any) => {
        if (response.data && checked) {
          this.createCalendarAccessWindow(response.data.url);
        }
      })
    )
  }

  googleCallback(code: string) {
    return this.http.get<any>(this.url + 'google-calendar-callback?code=' + code, {}).pipe(
      map((response: any) => {
        if (window.name === CalendarType.POPUP_NAME) {
          window.close();
        }
        return response;
      })
    )
  }

  msCallback(code: string) {
    return this.http.get<any>(this.url + 'ms-calendar-callback?code=' + code, {}).pipe(
      map((response: any) => {
        if (window.name === CalendarType.POPUP_NAME) {
          window.close();
        }
        return response;
      })
    )
  }

  createCalendarAccessWindow(
    url: string,
    name = CalendarType.POPUP_NAME,
    width = 450,
    height = 500,
    left = 500,
    top = 165) {

    if (url == null) {
      return null;
    }

    const options = `width=${width},height=${height},left=${left},top=${top}, scrollbars=0`;
    return window.open(url, name, options);
  }
}
