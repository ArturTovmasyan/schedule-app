import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomeComponent} from './core/components/home/home.component';
import {HeaderComponent} from './core/components/header/header.component';
import {AuthComponent} from './core/components/auth/auth.component';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {jwtInterceptorProvider} from './core/interceptors/jwt.interceptor';
import {errorInterceptorProvider} from './core/interceptors/error.interceptor';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {LoginComponent} from './core/components/login/login.component';
import {FooterComponent} from './core/components/footer/footer.component';
import {SignupComponent} from './core/components/signup/signup.component';
import {ValidationService} from "./core/services/validation/validation.service";
import {ControlMessageComponent} from "./core/components/control-message/control-message.component";

@NgModule({
  declarations: [AppComponent, HomeComponent, HeaderComponent, AuthComponent, LoginComponent, FooterComponent, SignupComponent, ControlMessageComponent],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  providers: [
    jwtInterceptorProvider,
    errorInterceptorProvider,
    ValidationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
