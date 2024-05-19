import {Component, OnInit, ViewChild} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {first} from 'rxjs/operators';
import {AuthService} from 'src/app/core/services/auth/auth.service';
import {BroadcasterService, ValidationService} from "../../../shared/services";
import {ErrorResponse} from "../../interfaces/error/error-response.interface";
import {MSAL_GUARD_CONFIG, MsalBroadcastService, MsalGuardConfiguration, MsalService} from "@azure/msal-angular";
import {HttpClient} from "@angular/common/http";
import {AuthenticationResult, InteractionStatus} from '@azure/msal-browser';
import {Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {environment} from "../../../../environments/environment";
import {Subject} from 'rxjs';

@Component({
  selector: 'lib-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  returnUrl: string;
  errorMessage: string | undefined;
  error?: ErrorResponse;
  showPassword = false;
  showRequiredErrors = false;
  private readonly _destroying$ = new Subject<void>();

  @ViewChild("focusField") focusField: any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private broadcaster: BroadcasterService
  ) {
    this.form = this.formBuilder.group({
      email: ['', { validators: [ValidationService.emailValidator, Validators.required], updateOn: 'blur' }],
      password: ['', { validators: [Validators.required], updateOn: 'change' }],
      remember: [false]
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  ngOnInit(): void {
    this.authService.logout();
    this.broadcaster.broadcast('isLoginPage', true);
    this.broadcaster.broadcast('isAuthPage', true);
    this.broadcaster.broadcast('isLandingPage', false);
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.focusField.nativeElement.focus();
      this.showRequiredErrors = true;
      return;
    }

    this.authService
      .login(this.form.value)
      .pipe(first())
      .subscribe({
        next: () => {
          this.form.reset();
          this.router.navigate(['/onboarding/calendar']);
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  googleLogin() {
    window.location.href = environment.host + "api/auth/google";
  }

  async microsoftLogin() {
      await this.msService.loginPopup()
        .subscribe({
          next: (result) => {
             this.getProfileData(result);
          },
          error: (error) => console.log(error)
        });
  }

  async getProfileData(result: AuthenticationResult) {
    await this.http.get(GRAPH_ENDPOINT)
      .subscribe({
        next: (profileData) => {
            this.authService.microsoftLogin(profileData, result.accessToken).subscribe({
            next: (data) => {
              if (data) {
                this.router.navigate(['/']);
              } else {
                this.router.navigate(['/login']);
              }
            },
            error: () => {
              this.router.navigate(['/404']);
            }
          });
        },
        error: (error) => console.log(error)
      });
  }

  setLoginDisplay() {
    this.loginDisplay = this.msService.instance.getAllAccounts().length > 0;
  }

  ngOnDestroy(): void {
    this._destroying$.next();
    this._destroying$.complete();
  }

  togglePasswordType() {
    this.showPassword = !this.showPassword;
  }
}
