import { Injectable } from '@angular/core';
import {
  CanActivate,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RedirectGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const currentUser = this.authService.currentUserValue;
    console.log('rrrr', this.authService.currentUserValue);
    console.log('aaaaaaa==>', !(currentUser && currentUser.accessToken));
    return !(currentUser && currentUser.accessToken);
  }
}
