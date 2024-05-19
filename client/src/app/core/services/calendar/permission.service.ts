import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {map} from 'rxjs/operators';
import {ApiResponse} from '../../interfaces/response/api.response.interface';
import {CalendarPermission} from "../../interfaces/calendar/permission.calendar.inteface";
import {CalendarType} from "../../components/calendar/connect-calendar/connect-calendar.component";
import { CalendarData } from '@fullcalendar/core';

@Injectable({
  providedIn: 'root'
})
export class CalendarPermissionService {

  constructor(
    private readonly http: HttpClient,
  ) {
  }

  get url(): string {
    return '/api/calendar-permissions';
  }

  fetch() {
    return this.http.get<ApiResponse<CalendarPermission>>(this.url + '/status-of-calendars', {}).pipe(
      map((response: ApiResponse<CalendarPermission>) => {
        return response;
      })
    )
  }

  fetchCalendars() {
    return this.http.get<ApiResponse<CalendarData>>(`${this.url}/calendars`, {}).pipe(
      map((response: ApiResponse<CalendarData>) => {
        return response;
      })
    )
  }

  connectGoogleCalendar() {
    return this.http.post<string>(`${this.url}/google-calendar`, {}).pipe(
      map((response: any) => {
        if (response.data) {
          return response.data.url;
        }
      })
    );
  }

  disconnectGoogleCalendar(calendarId: string) {
    return this.http.post<any>(`${this.url}/google-calendar/revoke`, { calendarId });
  }

  connectOffice365Calendar() {
    return this.http.post<any>(this.url + '/ms-calendar', {}).pipe(
      map((response: any) => {
        if (response.data) {
          return response.data.url
        }
      })
    )
  }

  disconnectOffice365Calendar(calendarId: string) {
    return this.http.post<any>(`${this.url}/ms-calendar/revoke`, { calendarId });
  }

  connectZoom() {
    return this.http.post<ApiResponse<any>>('/api/integrations/zoom/oauth', {})
      .pipe(
        map((response: any) => {
          if (response.data) {
            return response.data.url
          }
        })
      )
  }

  zoomCallback(code: string) {
    return this.http.get<any>(`/api/integrations/zoom/oauth/callback?code=${code}`, {}).pipe(
      map((response: any) => {
        if (window.name === CalendarType.PopupName) {
          window.close();
        }
        return response;
      })
    )
  }

  googleCallback(code: string) {
    return this.http.get<any>(this.url + '/google-calendar-callback?code=' + code, {}).pipe(
      map((response: any) => {
        if (window.name === CalendarType.PopupName) {
          window.close();
        }
        return response;
      })
    )
  }

  msCallback(code: string) {
    return this.http.get<any>(this.url + '/ms-calendar-callback?code=' + code, {}).pipe(
      map((response: any) => {
        if (window.name === CalendarType.PopupName) {
          window.close();
        }
        return response;
      })
    )
  }

  createCalendarAccessWindow(
    url: string,
    name = CalendarType.PopupName,
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
