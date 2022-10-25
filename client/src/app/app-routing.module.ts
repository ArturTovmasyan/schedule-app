import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './core/components/auth/auth.component';
import { HomeComponent } from './core/components/home/home.component';
import {  NgModule } from '@angular/core';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './core/components/login/login.component';
import {SignupComponent} from "./core/components/signup/signup.component";
import {ResetPasswordComponent} from "./core/components/reset-password/reset-password.component";
import {ConfirmAccountComponent} from "./core/components/confirm-account/confirm-account.component";
import {RecoveryPasswordComponent} from "./core/components/recovery-password/recovery-password.component";
import {P404Component} from "./core/components/error/404.component";
import {P500Component} from "./core/components/error/500.component";
import {RedirectGuard} from "./core/guards/redirect.guard";
import {OauthLoginComponent} from "./core/components/oauth-login/oauth-login.component";
<<<<<<< HEAD
=======
import {PaymentSuccessComponent} from "./core/components/payment/payment-success/payment-success.component";
import {
  GoogleCalendarComponent
} from "./core/components/calendar/calendar-permission/google-calendar/google-calendar.component";
import {MsCalendarComponent} from "./core/components/calendar/calendar-permission/ms-calendar/ms-calendar.component";
import {CalendarComponent} from "./core/components/calendar/calendar.component";
import {AccessRequestComponent} from "./core/components/calendar/access-request/access-request.component";
import {ShareCalendarComponent} from "./core/components/calendar/share-calendar/share-calendar.component";
import {ContactsComponent} from "./core/components/calendar/contacts/contacts.component";
import {MeetingComponent} from "./core/components/calendar/meeting/meeting.component";
import {ProposeTimeSlotComponent} from "./core/components/calendar/propose-time-slot/propose-time-slot.component";
import {SettingsComponent} from './core/components/settings/settings.component';
import {AvailabilityComponent} from './core/components/availability/availability.component';
import {ConfigurationComponent} from './core/components/configuration/configuration.component';
import {ConnectCalendarComponent} from './core/components/calendar/connect-calendar/connect-calendar.component';
import {ChangePasswordComponent} from "./core/components/change-password/change-password.component";
import {AccountInfoComponent} from "./core/components/account-info/account-info.component";
import {OnboardingComponent} from "./core/components/onboarding/onboarding.component";

import {
  OnboardingCalendarComponent
} from './core/components/onboarding/onboarding-calendar/onboarding-calendar.component';
import {
  OnboardingAvailabilityComponent
} from './core/components/onboarding/onboarding-availability/onboarding-availability.component';
import {
  OnboardingConfigurationComponent
} from './core/components/onboarding/onboarding-configuration/onboarding-configuration.component';
import {SubscriptionPlanComponent} from "./core/components/subscription-plan/subscription-plan.component";
import {PrivacyPolicyComponent} from "./core/components/privacy-policy/privacy-policy.component";
import {TermsConditionsComponent} from "./core/components/terms-conditions/terms-conditions.component";
import {InviteAndConnectComponent} from "./core/components/calendar/invite-and-connect/invite-and-connect.component";
>>>>>>> 8a0cab6 (Add invite and connect component)

const routes: Routes = [
  {path: '', redirectTo: 'calendar/access-request', pathMatch: 'full'},
  {path: 'calendar', redirectTo: 'calendar/access-request', pathMatch: 'full'},
  {path: '404', component: P404Component, data: {title: 'Page 404'}},
  {path: '500', component: P500Component, data: {title: 'Page 500'}},
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
    data: {title: 'Privacy Policy'}
  },
  {
    path: 'terms-conditions',
    component: TermsConditionsComponent,
    data: {title: 'Terms & Conditions'}
  },
  {
    path: '',
    children: [
      {
        path: 'payment-success',
        component: PaymentSuccessComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'google-calendar-callback',
        component: GoogleCalendarComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'ms-calendar-callback',
        component: MsCalendarComponent,
        canActivate: [AuthGuard],
      },
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
        path: 'recovery-password',
        component: RecoveryPasswordComponent,
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
  },
  {
    path: 'onboarding',
    component: OnboardingComponent,
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
      },
      {
        path: 'account-info',
        component: AccountInfoComponent
      },
      {
        path: '**',
        redirectTo: '/onboarding/calendar'
      }
    ]
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'calendar',
        component: ConnectCalendarComponent
      },
      {
        path: 'configuration',
        component: ConfigurationComponent
      },
      {
        path: 'availability',
        component: AvailabilityComponent
      },
      {
        path: 'password',
        component: ChangePasswordComponent
      },
      {
        path: 'account-info',
        component: AccountInfoComponent
      },
      {
        path: 'terms-conditions',
        component: TermsConditionsComponent,
        data: {title: 'Terms & Conditions'}
      },
      {
        path: 'privacy-policy',
        component: PrivacyPolicyComponent,
        data: {title: 'Privacy Policy'}
      },
      {
        path: '**',
        redirectTo: '/settings/availability'
      }
    ]
  },
  {
    path: 'calendar',
    component: CalendarComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'access-request',
        component: AccessRequestComponent
      },
      {
        path: 'share',
        component: ShareCalendarComponent
      },
      {
        path: 'contacts',
        component: ContactsComponent
      },
      {
        path: 'meeting',
        component: MeetingComponent
      },
      {
        path: 'propose-time',
        component: ProposeTimeSlotComponent
      },
      {
        path: 'invite',
        component: InviteAndConnectComponent
      }
    ]
  },
  {
    path: '**', redirectTo: '/404'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: !isIframe ? 'enabledNonBlocking' : 'disabled' // enabledNonBlocking
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
