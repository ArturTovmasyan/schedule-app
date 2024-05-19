import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ApiResponse } from '../../interfaces/response/api.response.interface';

@Injectable()
export class SharableLinkService {

  constructor(private readonly http: HttpClient) { }

  createLink(formData: any) {
    return this.http.post<ApiResponse<any>>('/api/sharable-links', { ...formData });
  }

  updateLink(id: string, formData: any) {
    return this.http.patch<ApiResponse<any>>(`/api/sharable-links/${id}`, { ...formData });
  }

  getDetails(linkId: string) {
    return this.http.get<ApiResponse<any>>(`/api/sharable-links/${linkId}`);
  }

  getLocations() {
    return this.http.get<ApiResponse<any>>('/api/integrations/linked-integrations')
      .pipe(
        map((response) => {
          return response.data
        })
      );
  }


  loadContacts() {
    return this.http.get<ApiResponse<any>>('/api/contacts')
      .pipe(
        map((response) => {
          return response.data
        })
      );
  }

}
