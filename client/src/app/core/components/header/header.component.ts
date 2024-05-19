import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from 'src/app/core/services/auth/auth.service';
import {BroadcasterService} from "../../../shared/services";
import {BehaviorSubject} from "rxjs";
import {environment} from "../../../../environments/environment";
import {MICROSOFT_USER} from "../../interfaces/constant/user.constants";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoginPage = true;
  loggedUser = false;
  subscription: BehaviorSubject<string>;
  isLoggedIn$ = this.authService.currentUser;

  constructor(
    private authService: AuthService,
    private router: Router,
    private broadcaster: BroadcasterService) {
    this.isLoginPage = window.location.pathname !== '/register';

    this.subscription = this.broadcaster.on('isLoginPage').subscribe((data: boolean) => {
      this.isLoginPage = data;
    });

    this.subscription = this.broadcaster.on('logged').subscribe((logged: boolean) => {
      this.loggedUser = logged;
    });

  }

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user && user.accessToken) {
      this.loggedUser = true;
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  get isAuthenticated(): boolean {
    return this.loggedUser;
  }

  get title() {
    return 'Handshake';
  }

  register() {
    this.isLoginPage = false;
    this.router.navigate(['/register']);
  }

  login() {
    this.isLoginPage = true;
    this.router.navigate(['/login']);
  }

  logout() {
    this.loggedUser = false;
    const user = JSON.parse(localStorage.getItem('cu') || 'null')
    this.authService.logout();

    if (user && user.provider) {
      if (user.provider === MICROSOFT_USER) {
        window.location.href = environment.ms_logout_url;
      }
    } else {
      this.router.navigate(['/login']);
    }
  }
}
