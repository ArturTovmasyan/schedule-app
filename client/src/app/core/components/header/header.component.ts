import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from 'src/app/core/services/auth/auth.service';
import {ApplicationUser} from "../../interfaces/user/app.user.interface";
import {BroadcasterService} from "../../../shared/services";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoginPage: boolean = true;
  currentUser: ApplicationUser | null = null;
  subscription: any;

  constructor(private authService: AuthService, private router: Router, private broadcaster: BroadcasterService) {
    this.isLoginPage = window.location.pathname !== '/register';
    this.subscription = this.broadcaster.on('isLoginPage').subscribe((data: boolean) => {
      this.isLoginPage = data;
    });
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe({
      next: (user) => {
        this.currentUser = user;
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  get isAuthenticated(): boolean {
    return !!this.currentUser;
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
