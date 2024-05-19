import {Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {

    const token = JSON.parse(localStorage.getItem('cu') || 'null');

    if (token && token.accessToken) {
      this.authService.hasAccess().subscribe({
        next: ({ user }) => { //isActive
          if (!user) { // && !isActive
            this.router.navigate(['/logout'])
          }
        }
      });

      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
