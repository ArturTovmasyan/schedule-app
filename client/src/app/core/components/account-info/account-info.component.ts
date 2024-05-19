import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthService} from "../../services/auth/auth.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { User } from '../../interfaces/user/app.user.interface';

@Component({
  selector: 'app-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss']
})
export class AccountInfoComponent implements OnInit {

  @ViewChild('fileInput', { static: false })
  fileInput!: ElementRef;
  firstName = '';
  lastName = '';
  email = '';
  avatar = '';
  error:any = null;
  acceptedFileExtensions = 'image/*';
  currentUser: User | null = null;

  constructor(private authService:AuthService, private readonly http: HttpClient) { }

  ngOnInit(): void {
    this.authService.hasAccess().subscribe({
      next: ({ user }) => {
        if (user) {
            this.currentUser = user;
            this.firstName = user.firstName;
            this.lastName = user.lastName;
            this.email = user.email;
            this.avatar = user.avatar;
        }
      }
    });
  }

  attachFile(event: any) {
    const file: File = event.target.files?.[0];

    if (file) {
      const formData = new FormData();
      formData.append('file', file, file.name);

      const uploadFileHeaders = new HttpHeaders({
        Accept: `application/json, text/plain, */*`,
      });
      
      this.http
        .put('/api/users/avatar', formData, {headers: uploadFileHeaders}).subscribe({
          next: (response:any) => {
            this.avatar = response.data.url;
            const changedUserData = this.currentUser!;
            changedUserData['avatar'] = this.avatar;
            this.authService.setCurrentUser({'user':changedUserData});
            this.reset();
          },
          error: (error) => {
            this.error = error;
          },
        });
    }
  }

  reset() {
    this.fileInput.nativeElement.value = null;
  }
}
