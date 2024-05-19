import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {AuthService} from "../../services/auth/auth.service";

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit, OnDestroy {

  fullName = '';
  avatar = '';
  subscription$!: Subscription;

  @Input() showDropdown = true;

  constructor(
    private authService:AuthService,
    private router: Router,) { }

  ngOnInit(): void {
    this.subscription$ = this.authService.currentUser.subscribe(res => {
      this.fullName = res?.user?.fullName ?? '';
      this.avatar = res?.user?.avatar ?? '';
    });
    // removed as hasAccess is called from gaurd also
    // this.authService.hasAccess().subscribe({
    //   next: ({ user }) => {
    //     if (user) {
    //       this.fullName = user.firstName+ ' ' + user.lastName;
    //       this.avatar = user.avatar;
    //     }
    //   }
    // });
  }

  ngOnDestroy(): void {
    this.subscription$.unsubscribe();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
