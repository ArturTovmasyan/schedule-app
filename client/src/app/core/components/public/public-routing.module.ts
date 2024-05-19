import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingPageComponent } from './pages/landing/landing.component';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './pages/login/login.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { SignupComponent } from './pages/signup/signup.component';
import { TermsConditionsComponent } from './pages/terms-conditions/terms-conditions.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { ConfirmAccountComponent } from './pages/confirm-account/confirm-account.component';
import { OauthLoginComponent } from './pages/oauth-login/oauth-login.component';
import { RedirectGuard } from '../../guards/redirect.guard';
import { RecoveryPasswordComponent } from './pages/recovery-password/recovery-password.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: LandingPageComponent
      },
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'register',
        component: SignupComponent,
        canActivate: [RedirectGuard]
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent,
        canActivate: [RedirectGuard]
      },
      {
        path: 'new-password',
        component: RecoveryPasswordComponent,
        data: {title: 'Change Password'},
        canActivate: [RedirectGuard]
      },
      {
        path: 'terms-conditions',
        component: TermsConditionsComponent,
        data: { title: 'Terms & Conditions' }
      },
      {
        path: 'privacy-policy',
        component: PrivacyPolicyComponent,
        data: { title: 'Privacy Policy' }
      },
      {
        path: 'confirm',
        component: ConfirmAccountComponent,
        data: {title: 'Confirm Registration'}
      },
      {
        path: 'logout',
        redirectTo: 'login'
      },
      {
        path: 'oauth/success',
        component: OauthLoginComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
