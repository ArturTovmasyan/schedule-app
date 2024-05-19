import {Component} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import { ToastrService } from 'ngx-toastr';
import {AuthService} from "../../../../services/auth/auth.service";

@Component({
  templateUrl: './confirm-account.component.html'
})
export class ConfirmAccountComponent {

  readonly confirmToken: string = '';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private toastrService: ToastrService) {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.accessToken) {
      this.toastrService.info("Email already confirmed", '', {
        timeOut: 4000,
        positionClass: 'toast-top-center'
      });
      this.router.navigate(['/onboarding/calendar']);
      return;
    }
    this.confirmToken = this.route.snapshot.queryParams['token'];

    if (this.confirmToken) {
        this.authService.confirmAccount(this.confirmToken).subscribe({
          next: (confirmed) => {
            if (confirmed) {
              this.router.navigate(['/onboarding/calendar']);
            } else {
              this.router.navigate(['/login']);
            }
            this.toastrService.info("Email already confirmed", '', {
              timeOut: 4000,
              positionClass: 'toast-top-center'
            });
          },
          error: () => {
            this.toastrService.error("Error on email confirmation. Please try again.", '', {
              timeOut: 3000,
              positionClass: 'toast-top'
            });
            this.router.navigate(['/login']);
          }
        });
    }
  }
}
