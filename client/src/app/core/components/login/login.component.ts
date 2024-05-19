import {Component, Inject, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {first} from 'rxjs/operators';
import {AuthService} from 'src/app/core/services/auth/auth.service';
import {BroadcasterService, ValidationService} from "../../../shared/services";
import {ErrorResponse} from "../../interfaces/error/error-response.interface";
import {MSAL_GUARD_CONFIG, MsalBroadcastService, MsalGuardConfiguration, MsalService} from "@azure/msal-angular";
import {HttpClient} from "@angular/common/http";
import {InteractionStatus} from '@azure/msal-browser';
import {Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {environment} from "../../../../environments/environment";

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/me';

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
  isIframe = false;
  loginDisplay = false;
  private readonly _destroying$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private broadcaster: BroadcasterService,
    private broadcastService: MsalBroadcastService,
    private msService: MsalService,
    private http: HttpClient,
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration
  ) {
    this.form = this.formBuilder.group({
      email: ['', [ValidationService.emailValidator, Validators.required]],
      password: ['', [Validators.required]],
      remember: ['']
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  ngOnInit(): void {
    this.authService.logout();
    this.broadcaster.broadcast('isLoginPage', true);

    this.isIframe = window !== window.parent && !window.opener;
    this.broadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.setLoginDisplay();
      })
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    this.authService
      .login(this.form.value)
      .pipe(first())
      .subscribe({
        next: () => {
          this.form.reset();
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  googleLogin() {
    window.location.href = environment.host + "api/auth/google";
  }

  microsoftLogin() {
      this.msService.loginPopup()
        .subscribe({
          next: (result) => {
            debugger;
            if (result.accessToken) {
              this.http.get(GRAPH_ENDPOINT)
                .subscribe({

                  next: (profileData) => {
                    this.authService.microsoftLogin(profileData).subscribe({
                      next: (data) => {
                        debugger;
                        console.log(data);
                      },
                      error: (error) => {
                        this.router.navigate(['/']);
                      }
                    });
                  },
                  error: (error) => console.log(error)
                });
            }
          },
          error: (error) => console.log(error)
        });
  }

   getProfileData() {
    this.http.get(GRAPH_ENDPOINT)
      .subscribe({

        next: (profileData) => {
          this.authService.microsoftLogin(profileData).subscribe({
            next: (data) => {
              debugger;
              console.log(data);
            },
            error: (error) => {
              this.router.navigate(['/']);
            }
          });
        },
        error: (error) => console.log(error)
      });
  }

  msLogout() {
    this.msService.logoutRedirect({
      postLogoutRedirectUri: environment.host
    });
  }

  setLoginDisplay() {
    this.loginDisplay = this.msService.instance.getAllAccounts().length > 0;
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
