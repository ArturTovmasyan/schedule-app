import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../interfaces/response/api.response.interface';
import { AccessRequest } from '../../interfaces/calendar/access-request.interface';
import { CalendarAccess } from '../../interfaces/calendar/calendar-access.interface';

@Injectable({
  providedIn: 'root'
})
export class CalendarAccessService {

  constructor(
    private readonly http: HttpClient
  ) {
  }

  requestCalendarAccess(formData: AccessRequest) {
    return this.http.post<ApiResponse<AccessRequest>>('/api/calendar/access-request', {...formData}, {
    }).pipe(
      map(() => {
        return formData
      })
    );
  }

  shareCalendarAccess(formData: AccessRequest) {
    return this.http.post<ApiResponse<AccessRequest>>('/api/calendar/access', {...formData}, {
    }).pipe(
      map(() => {
        return formData
      })
    );
  }

  fetchAccessibleContacts() {
    return this.http.get<ApiResponse<CalendarAccess[]>>('/api/calendar/access/accessed', {})
      .pipe(
        map((response: ApiResponse<CalendarAccess[]>) => {
          return response.data;
        })
      )
  }

  approveAccessRequest(requestId: string) {
    return this.updateAccessRequest(requestId, 'accept')
  }

  denyAccessRequest(requestId: string) {
    return this.updateAccessRequest(requestId, 'decline')
  }

  private updateAccessRequest(requestId: string, status: string) {
    return this.http.patch<ApiResponse<any>>(`/api/calendar/access-request/${requestId}`, { status }, {})
    .pipe(
      map(() => {
        return {}
      })
    );
  }
}
