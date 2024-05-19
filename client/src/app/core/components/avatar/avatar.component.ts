import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../services/auth/auth.service";

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit {

  fullName:string = '';
  avatar:string = '';

  constructor(private authService:AuthService) { }

  ngOnInit(): void {
    this.authService.hasAccess().subscribe({
      next: ({ user }) => {
        if (user) {
          this.fullName = user.firstName+ ' ' + user.lastName;
          this.avatar = user.avatar;
        }
      }
    });
  }
}
