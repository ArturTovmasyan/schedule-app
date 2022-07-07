import {Component} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../services/auth/auth.service";

@Component({
  templateUrl: './confirm-account.component.html'
})
export class ConfirmAccountComponent {

  readonly confirmToken: string = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router) {
    this.confirmToken = this.route.snapshot.queryParams['token'];

    if (this.confirmToken) {
        this.authService.confirmAccount(this.confirmToken).subscribe({
          next: (confirmed) => {
            if (confirmed) {
              this.router.navigate(['/']);
            }
          },
          error: () => {
            this.router.navigate(['/404']);
          }
        });
    }
  }
}
