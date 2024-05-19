import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../../interfaces/response/api.response.interface';
import { Invitation } from '../../interfaces/calendar/invitation.interface';

@Injectable({
  providedIn: 'root'
})
export class CalendarInvitationService {

  constructor(
    private readonly http: HttpClient
  ) {
  }

  sendInvitation(formData: Invitation) {
    return this.http.post<ApiResponse<Invitation>>('/api/invitation', { ...formData });
  }

}
