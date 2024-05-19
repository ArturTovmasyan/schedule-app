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
<<<<<<< HEAD
<<<<<<< HEAD
       return this.authService.isAuthenticated();
=======
      this.authService.hasAccess(token.accessToken).subscribe({
        next: (user) => {
          if (user && !user.stripeSubscriptionId) {
=======
      this.authService.hasAccess().subscribe({
        next: ({ isActive, user }) => {
          if (user && !isActive) {
>>>>>>> 2cd4f4b (Finish payment integration)
            this.router.navigate(['/onboarding/subscription-plan'])
          }
        }
      });
      return true;
>>>>>>> a6d9f60 (Finish payment functionality)
    }

    this.router.navigate(['/login']);
    return false;
  }
}
