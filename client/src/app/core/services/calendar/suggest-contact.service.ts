import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ApiResponse} from '../../interfaces/response/api.response.interface';
import {SuggestContactResponse} from "../../interfaces/contact/suggest-contact.interface";

@Injectable({
  providedIn: 'root'
})
export class SuggestContactService {

  constructor(private readonly http: HttpClient) {
  }

  getSuggestContact() {
    return this.http.get<ApiResponse<SuggestContactResponse>>('/api/contacts');
  }
}
