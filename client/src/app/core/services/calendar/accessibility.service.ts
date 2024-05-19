import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../interfaces/response/api.response.interface';
import { CalendarAccessibility } from '../../interfaces/calendar/accessibility.calendar.inteface';

@Injectable({
  providedIn: 'root'
})
export class AccessibilityService {

  constructor(
    private readonly http: HttpClient,
  ) {
  }

  get url(): string {
    return '/api/calendar/accessibility';
  }

  create(formData: CalendarAccessibility) {
    return this.http.post<ApiResponse<any>>(this.url, {...formData}, {
    }).pipe(
      map(() => {
        return formData
      })
    );
  }

  update(formData: CalendarAccessibility) {
    return this.http.patch<ApiResponse<any>>(this.url, {...formData}, {
    }).pipe(
      map(() => {
        return formData
      })
    );
  }

  delete() {
    return this.http.delete<ApiResponse<any>>(this.url, {
    }).pipe(
      map(() => {
        return true
      })
    )
  }

  fetch() {
    return this.http.get<ApiResponse<CalendarAccessibility>>(this.url, {
    }).pipe(
      map((response: ApiResponse<CalendarAccessibility>) => {
        return response.data
      })
    )
  }
}
