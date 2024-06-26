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

const routes: Routes = [
  {path: '404', component: P404Component, data: {title: 'Page 404'}},
  {path: '500', component: P500Component, data: {title: 'Page 500'}},
  {
    path: 'payment-success',
    component: PaymentSuccessComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'google-calendar-callback',
    component: GoogleCalendarComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'ms-calendar-callback',
    component: MsCalendarComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '',
    loadChildren: () => import('./core/components/public/public.module').then(m => m.PublicModule),
    // component: AuthComponent,
    // children: [
    //   {
    //     path: 'login',
    //     component: LoginComponent
    //   },
    //   {
    //     path: 'logout',
    //     redirectTo: 'login'
    //   },
    //   {
    //     path: 'confirm',
    //     component: ConfirmAccountComponent,
    //     data: {title: 'Confirm Registration'}
    //   },

    //   {
    //     path: 'register',
    //     component: SignupComponent,
    //     data: {title: 'Sign Up'},
    //     canActivate: [RedirectGuard]
    //   },
    //   {
    //     path: 'reset-password',
    //     component: ResetPasswordComponent,
    //     data: {title: 'Reset Password'},
    //     canActivate: [RedirectGuard]
    //   },

    // ]
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
        path: '**',
        redirectTo: '/settings/availability'
      }
    ]
  },
  {
    path: 'integrations/zoom',
    component: ZoomOauthComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: ZoomSetupComponent
      },
      {
        path: 'callback',
        component: ZoomCallbackComponent
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
        path: 'meeting/:id',
        component: MeetingComponent
      },
      {
        path: 'propose-time',
        component: ProposeTimeSlotComponent
      },
      {
        path: 'invite',
        component: InviteAndConnectComponent
      },
      {
        path: 'suggest-contact',
        component: SuggestContactComponent
      },
      {
        path: 'sharable-link/create',
        component: SharableLinkComponent
      },
      {
        path: 'sharable-link',
        component: SharableLinkListComponent
      },
      {
        path: 'sharable-link/:id',
        component: SharableLinkComponent
      },
      {
        path: 'group-availability',
        component: GroupAvailabilityComponent
      }
    ]
  },
  {
    path: 'share',
    loadChildren: () => import('./core/components/public/calendar/calendar.module').then(m => m.PublicCalendarModule)
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
