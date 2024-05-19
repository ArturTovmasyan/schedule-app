import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './core/components/auth/auth.component';
import { HomeComponent } from './core/components/home/home.component';
import {  NgModule } from '@angular/core';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './core/components/login/login.component';
import {SignupComponent} from "./core/components/signup/signup.component";
import {ResetPasswordComponent} from "./core/components/reset-password/reset-password.component";
import {ConfirmAccountComponent} from "./core/components/confirm-account/confirm-account.component";
import {ChangePasswordComponent} from "./core/components/change-password/change-password.component";
import {P404Component} from "./core/components/error/404.component";
import {P500Component} from "./core/components/error/500.component";
import {RedirectGuard} from "./core/guards/redirect.guard";
import {OauthLoginComponent} from "./core/components/oauth-login/oauth-login.component";

const routes: Routes = [
  {path: '', redirectTo: 'onboarding/calendar', pathMatch: 'full'}, //TODO will redirect to calendar main page
  {path: '404', component: P404Component, data: {title: 'Page 404'}},
  {path: '500', component: P500Component, data: {title: 'Page 500'}},
  {
    path: '',
    children: [
      {
        path: 'payment-success',
        component: PaymentSuccessComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'google-calendar',
        component: GoogleCalendarComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'ms-calendar',
        component: MsCalendarComponent,
        canActivate: [AuthGuard],
      },
    ]
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'onboarding',
        component: HomeComponent,
        canActivate: [AuthGuard],
        children: [
          {
            path: 'subscription-plan',
            component: SubscriptionPlanComponent
          },
          {
            path: 'calendar',
            component: OnboardingCalendarComponent
          },
          {
            path: 'configuration',
            component: OnboardingConfigurationComponent
          },
          {
            path: 'availability',
            component: OnboardingAvailabilityComponent
          }
        ]
      },
      {
        path: '',
        component: AuthComponent,
        children: [
          {
            path: 'login',
            component: LoginComponent
          },
          {
            path: 'confirm',
            component: ConfirmAccountComponent,
            data: {title: 'Confirm Registration'},
            canActivate: [RedirectGuard]
          },
          {
            path: 'change-password',
            component: ChangePasswordComponent,
            data: {title: 'Change Password'},
            canActivate: [RedirectGuard]
          },
          {
            path: 'register',
            component: SignupComponent,
            data: {title: 'Sign Up'},
            canActivate: [RedirectGuard]
          },
          {
            path: 'reset-password',
            component: ResetPasswordComponent,
            data: {title: 'Reset Password'},
            canActivate: [RedirectGuard]
          },
          {
            path: 'oauth/success',
            component: OauthLoginComponent
          }
        ]
      }
    ]
  },
  {path: '**', redirectTo: '/404'}
];

const isIframe = window !== window.parent && !window.opener;

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: !isIframe ? 'enabledNonBlocking' : 'disabled' // enabledNonBlocking
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
