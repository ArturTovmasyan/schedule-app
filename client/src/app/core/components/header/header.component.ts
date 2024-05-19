import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from 'src/app/core/services/auth/auth.service';
import {BroadcasterService} from "../../../shared/services";
import {BehaviorSubject} from "rxjs";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoginPage = true;
  loggedUser = false;
  subscription: BehaviorSubject<string>;

  constructor(private authService: AuthService, private router: Router, private broadcaster: BroadcasterService) {
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

  get slogan() {
    return '';
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
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
