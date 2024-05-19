import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../../interfaces/response/api.response.interface';
import { Invitation } from '../../interfaces/calendar/invitation.interface';
import { of } from 'rxjs';

@Injectable()
export class SharableLinkService {

  constructor(private readonly http: HttpClient) { }

  createLink(formData: any) {
    return this.http.post<ApiResponse<any>>('/api/sharable-links', { ...formData });
  }

  getDetails(linkId: string) {
    return this.http.get<ApiResponse<any>>(`/api/sharable-links/${linkId}`);
  }

}
