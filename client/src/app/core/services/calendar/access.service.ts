import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../interfaces/response/api.response.interface';
import { AccessRequest } from '../../interfaces/calendar/access-request.interface';

@Injectable({
  providedIn: 'root'
})
export class CalendarAccessService {

  constructor(
    private readonly http: HttpClient
  ) {
  }

  get url(): string {
    return '/api/calendar/access-request';
  }

  requestCalendarAccess(formData: AccessRequest) {
    return this.http.post<ApiResponse<AccessRequest>>(this.url, {...formData}, {
    }).pipe(
      map(() => {
        return formData
      })
    );
  }
}
