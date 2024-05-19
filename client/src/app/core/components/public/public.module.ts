import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IMaskModule } from 'angular-imask';
import { NgHttpLoaderModule } from 'ng-http-loader';
import { SharedModule } from 'src/app/shared/shared.module';
import { BroadcasterService } from 'src/app/shared/services';
import { PublicRoutingModule } from './public-routing.module';
import { PublicService } from './public.service';
import { LayoutComponent } from './layout/layout.component';
import { LandingPageComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { TermsConditionsComponent } from './pages/terms-conditions/terms-conditions.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { OauthLoginComponent } from './pages/oauth-login/oauth-login.component';
import { ConfirmAccountComponent } from './pages/confirm-account/confirm-account.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    LayoutComponent,
    LandingPageComponent,
    LoginComponent,
    SignupComponent,
    ResetPasswordComponent,
    TermsConditionsComponent,
    PrivacyPolicyComponent,
    OauthLoginComponent,
    ConfirmAccountComponent
  ],
  imports: [
    PublicRoutingModule,
    CommonModule,
    SharedModule,
    IMaskModule,
    HttpClientModule,
    NgHttpLoaderModule.forRoot()
  ],
  providers: [PublicService, DatePipe, BroadcasterService]
})
export class PublicModule { }
