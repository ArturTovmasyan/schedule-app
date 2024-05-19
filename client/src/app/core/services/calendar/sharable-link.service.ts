import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ApiResponse } from '../../interfaces/response/api.response.interface';

@Injectable()
export class SharableLinkService {

  constructor(private readonly http: HttpClient) { }

  getLinks(params: any) {
    console.log('oo', params);
    return this.http.get<ApiResponse<any>>(`/api/sharable-links`, { params : params });
  }

  createLink(formData: any) {
    return this.http.post<ApiResponse<any>>('/api/sharable-links', { ...formData });
  }

  updateLink(id: string, formData: any) {
    return this.http.patch<ApiResponse<any>>(`/api/sharable-links/${id}`, { ...formData });
  }

  deleteLink(id: string) {
    return this.http.delete(`/api/sharable-links/${id}`);
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
