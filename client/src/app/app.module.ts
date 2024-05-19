import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomeComponent} from './core/components/home/home.component';
import {HeaderComponent} from './core/components/header/header.component';
import {AuthComponent} from './core/components/auth/auth.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {LoginComponent} from './core/components/login/login.component';
import {FooterComponent} from './core/components/footer/footer.component';
import {SignupComponent} from './core/components/signup/signup.component';
import { ResetPasswordComponent } from './core/components/reset-password/reset-password.component';
import {BroadcasterService, ValidationService} from "./shared/services";
import {SharedModule} from "./shared/shared.module";
import { ConfirmAccountComponent } from './core/components/confirm-account/confirm-account.component';
import { ChangePasswordComponent } from './core/components/change-password/change-password.component';
import {P404Component} from "./core/components/error/404.component";
import {P500Component} from "./core/components/error/500.component";
import {jwtInterceptorProvider} from './core/interceptors/jwt.interceptor';
import {errorInterceptorProvider} from './core/interceptors/error.interceptor';
import { SubscriptionPlanItemComponent } from './core/components/subscription-plan-item/subscription-plan-item.component';
import { SubscriptionPlanComponent } from './core/components/subscription-plan/subscription-plan.component';
import { PaymentComponent } from './core/components/payment/payment.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    AuthComponent,
    LoginComponent,
    FooterComponent,
    SignupComponent,
    ResetPasswordComponent,
    ConfirmAccountComponent,
    ChangePasswordComponent,
    P404Component,
    P500Component,
    SubscriptionPlanItemComponent,
    SubscriptionPlanComponent,
    PaymentComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    MsAuthModule,
    IMaskModule,
    HttpClientModule,
    NgHttpLoaderModule.forRoot(),
  ],
  providers: [
    jwtInterceptorProvider,
    errorInterceptorProvider,
    ValidationService,
    BroadcasterService,
    CalendarPermissionService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    MsalGuard
  ],
  bootstrap: [AppComponent, MsalRedirectComponent]
})
export class AppModule {
}
