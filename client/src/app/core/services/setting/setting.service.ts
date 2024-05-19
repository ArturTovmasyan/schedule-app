import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from "rxjs/operators";
import {ChangePasswordInterface} from "../../interfaces/user/change.password.interface";

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  constructor(private readonly http: HttpClient) {}

  changePassword(formData: ChangePasswordInterface): Observable<boolean> {
    return this.http.patch<boolean>('/api/auth/change-password', {...formData}).pipe(
      map((response: boolean) => {
        return response;
      })
    );
  }
}
