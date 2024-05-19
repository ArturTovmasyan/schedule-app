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

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RecoveryPasswordComponent,
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
    IMaskModule,
    HttpClientModule,
    CalendarModule,
    NgHttpLoaderModule.forRoot(),
    ToastrModule.forRoot(),
    FormsModule,
    NgSelectModule
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
  bootstrap: [AppComponent]
})

export class AppModule {
}
