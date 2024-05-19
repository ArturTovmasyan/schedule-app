import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ApplicationUser} from "../../interfaces/user/app.user.interface";
import {LoginUser} from "../../interfaces/user/login.user.interface";
import {MicrosoftUserType} from "../../interfaces/user/microsof.user.interface";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<ApplicationUser | null>;
  public currentUser: Observable<ApplicationUser | null>;

  constructor(private readonly http: HttpClient) {

    this.currentUserSubject = new BehaviorSubject<ApplicationUser | null>(
      JSON.parse(localStorage.getItem('cu') || 'null')
    );

    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): ApplicationUser | null {
    return this.currentUserSubject.value;
  }

  login(formData: LoginUser) {
    return this.http.post<any>('/api/auth/login', {...formData}).pipe(
      map((response: any) => {
        if (response && response.accessToken) {
          localStorage.setItem('cu', JSON.stringify(response));
          this.currentUserSubject.next(response);
        }
        return response.user;
      })
    );
  }

  logout() {
    localStorage.clear();
    this.currentUserSubject.next(null);
  }

  /**
   * @param signupData
   * @returns {any}
   */
  signup(signupData: { firstName: any; lastName: any; password: any; email: string | undefined }) {
    return this.http.post<void>('/api/auth/register', signupData);
  }

  resetPassword(email: string) {
    return this.http.post<any>('/api/auth/reset-password', {email});
  }

  confirmAccount(token: string): Observable<boolean> {
    return this.http.get<boolean>('/api/auth/confirm?token=' + token).pipe(
      map((response: boolean) => {
        return response;
      })
    );
  }

  changePassword(token: string, password: string): Observable<boolean> {
    return this.http.patch<boolean>('/api/auth/change-password', {
      password,
      token
    }, {headers: this.authorizationHeader}).pipe(
      map((response: boolean) => {
        return response;
      })
    );
  }

  setBearerHeader(token: string) {
    return {
      'content-type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  isAuthenticated() {
      return this.http.post<boolean>('/api/auth/logged', {}).pipe(
        map((response: boolean) => {
          return response;
        })
      );
  }

  microsoftLogin(data: MicrosoftUserType, token: string) { //, token: string
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const requestOptions = { headers: headers };

    return this.http.post<any>('/api/auth/microsoft/callback', {...data}, requestOptions).pipe(
      map((response: any) => {
        if (response && response.accessToken) {
          localStorage.setItem('cu', JSON.stringify(response));
          this.currentUserSubject.next(response);
        }
        return response;
      })
    );
  }

  get authorizationHeader(): { [header: string]: string } {
    const token: string = this.currentUserValue?.accessToken ?? ''
    return this.currentUserValue != null ? { 'content-type': 'application/json', 'Authorization': `Bearer ${token}` } : {}
  }
}
