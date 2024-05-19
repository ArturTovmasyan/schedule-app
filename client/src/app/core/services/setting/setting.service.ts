import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from "rxjs/operators";
import {AuthService} from "../auth/auth.service";

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  constructor(private readonly http: HttpClient, private authService: AuthService) {}

  changePassword(token: string, password: string): Observable<boolean> {
    return this.http.patch<boolean>('/api/auth/change-password', {
      password,
      token
    }, {headers: this.authService.authorizationHeader}).pipe(
      map((response: boolean) => {
        return response;
      })
    );
  }
}
