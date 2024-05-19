import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationUser, AuthService } from 'src/app/services/auth/auth.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isLogin = true;

  currentUser: ApplicationUser | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe({
      next: (user) => {
        this.currentUser = user;
      }
    });
  }

  get isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  get title() {
    return 'Handshake';
  }

  get slogan() {
    return 'Make meetings work!';
  }

  register() {
    this.router.navigate(['/register']);
  }

  login() {
    this.router.navigate(['/login']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
