import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../interfaces/response/api.response.interface';
import { CalendarAvailability } from '../../interfaces/calendar/availability.calendar.interface';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {

  constructor(
    private readonly http: HttpClient
  ) {
  }

  get url(): string {
    return '/api/calendar/availability';
  }

  create(formData: CalendarAvailability) {
    return this.http.post<ApiResponse<any>>(this.url, {...formData}, {
    }).pipe(
      map(() => {
        return formData
      })
    );
  }

  update(formData: CalendarAvailability) {
    return this.http.patch<ApiResponse<any>>(this.url, {...formData}, {
    }).pipe(
      map(() => {
        return formData
      })
    );
  }

  fetch() {
    return this.http.get<CalendarAvailability>(this.url, {
    }).pipe(
      map((response: CalendarAvailability) => {
        return response
      })
    )
  }
}
