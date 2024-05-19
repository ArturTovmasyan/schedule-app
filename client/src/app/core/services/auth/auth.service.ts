import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export interface ApplicationUser {
  accessToken: string;
  expiresIn: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<ApplicationUser | null>;
  public currentUser: Observable<ApplicationUser | null>;

  constructor(private readonly http: HttpClient) {

    this.currentUserSubject = new BehaviorSubject<ApplicationUser | null>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );

    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): ApplicationUser | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string) {
    return this.http.post<any>('/api/auth/login', {email, password}).pipe(
      map((response: any) => {
        if (response && response.accessToken) {
          localStorage.setItem('currentUser', JSON.stringify(response));
          this.currentUserSubject.next(response);
        }
        return response.user;
      })
    );
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  /**
   * @param signupData
   * @returns {any}
   */
  signup(signupData: { firstName: any; lastName: any; password: any; email: string | undefined }) {
    debugger;
    return this.http.post('/api/auth/register', signupData).pipe(map(token_info => {
        if (token_info) { // && token_info.access_token
          localStorage.setItem('token', JSON.stringify(token_info));
        }
      })
    )
  }

  resetPassword(email: string) {
    return this.http.post<any>('/api/auth/reset-password', {email}).pipe(
      map((response: any) => {
        debugger;
        if (response) {
          return response;
        }
      })
    );
  }

  confirmAccount(token: string):Observable<boolean> {
    return this.http.get<any>('/api/auth/confirm?token='+token).pipe(
      map((response: boolean) => {
          return response;
      })
    );
  }

}
