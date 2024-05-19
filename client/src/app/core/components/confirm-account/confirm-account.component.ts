import {Component} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../services/auth/auth.service";

@Component({
  selector: 'app-confirm-account',
  templateUrl: './confirm-account.component.html',
  styleUrls: ['./confirm-account.component.scss']
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
            this.router.navigate(['/']);//TODO any info page about confirm error
          }
        });
    }
  }
}
