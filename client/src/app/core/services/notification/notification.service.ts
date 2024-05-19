import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { Notification } from '../../interfaces/notification.interface';
import { ApiResponse } from '../../interfaces/response/api.response.interface';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private readonly http: HttpClient
  ) {
  }

  get url(): string {
    return '/api/notifications';
  }

  fetch() {
    return this.http.get<ApiResponse<Notification[]>>(this.url, {
    }).pipe(
      map((response: ApiResponse<Notification[]>): [Notification[] | null, number] => {
        return [response.data, response.metadata?.['total'] ?? 0];
      })
    )
  }

  // create(formData: CalendarAccessibility) {
  //   return this.http.post<ApiResponse<any>>(this.url, {...formData}, {
  //   }).pipe(
  //     map(() => {
  //       return formData
  //     })
  //   );
  // }
}
