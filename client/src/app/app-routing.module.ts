import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './core/components/auth/auth.component';
import { HomeComponent } from './core/components/home/home.component';
import { NgModule } from '@angular/core';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './core/components/login/login.component';
import {SignupComponent} from "./core/components/signup/signup.component";
import {ResetPasswordComponent} from "./core/components/reset-password/reset-password.component";
import {ConfirmAccountComponent} from "./core/components/confirm-account/confirm-account.component";

//TODO In future will be change for use loadChildren (lazy load module)
const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard]
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
        component: ConfirmAccountComponent
      },
      {
        path: 'register', component: SignupComponent, data: {title: 'Sign Up'}
      },
      {
        path: 'reset-password', component: ResetPasswordComponent, data: {title: 'Reset Password'}
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
