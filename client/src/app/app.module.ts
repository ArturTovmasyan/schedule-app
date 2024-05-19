import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomeComponent} from './core/components/home/home.component';
import {HeaderComponent} from './core/components/header/header.component';
import {AuthComponent} from './core/components/auth/auth.component';
import {jwtInterceptorProvider} from './core/interceptors/jwt.interceptor';
import {errorInterceptorProvider} from './core/interceptors/error.interceptor';
import {HttpClientModule} from '@angular/common/http';
import {LoginComponent} from './core/components/login/login.component';
import {FooterComponent} from './core/components/footer/footer.component';
import {SignupComponent} from './core/components/signup/signup.component';
import { ResetPasswordComponent } from './core/components/reset-password/reset-password.component';
import {BroadcasterService, ValidationService} from "./shared/services";
import {SharedModule} from "./shared/shared.module";
import { ConfirmAccountComponent } from './core/components/confirm-account/confirm-account.component';

@NgModule({
  declarations: [AppComponent, HomeComponent, HeaderComponent, AuthComponent, LoginComponent, FooterComponent, SignupComponent, ResetPasswordComponent, ConfirmAccountComponent],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    SharedModule
  ],
  providers: [
    jwtInterceptorProvider,
    errorInterceptorProvider,
    ValidationService,
    BroadcasterService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
