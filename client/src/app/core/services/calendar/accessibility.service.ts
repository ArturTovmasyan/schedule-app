import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../interfaces/api.response.interface';
import { CalendarAccessibility } from '../../interfaces/calendar/accessibility.calendar.inteface';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AccessibilityService {

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {
  }

  get url(): string {
    return '/api/calendar-accessibility';
  }

  create(formData: CalendarAccessibility) {
    return this.http.post<ApiResponse<any>>(this.url, {...formData}, {
      headers: {
        ...this.authService.authorizationHHeader
      }
    }).pipe(
      map(() => {
        return formData
      })
    );
  }

  update(formData: CalendarAccessibility) {
    return this.http.patch<ApiResponse<any>>(this.url, {...formData}, {
      headers: {
        ...this.authService.authorizationHHeader
      }
    }).pipe(
      map(() => {
        return formData
      })
    );
  }

  delete() {
    return this.http.delete<ApiResponse<any>>(this.url, {
      headers: {
        ...this.authService.authorizationHHeader
      }
    }).pipe(
      map(() => {
        return true
      })
    )
  }

  fetch() {
    return this.http.get<ApiResponse<CalendarAccessibility>>(this.url, {
      headers: {
        ...this.authService.authorizationHHeader
      }
    }).pipe(
      map((response: ApiResponse<CalendarAccessibility>) => {
        return response.data
      })
    )
  }
}
