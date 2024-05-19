import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { HeaderComponent } from './components/header/header.component';
import {
  AuthModule,
  errorInterceptorProvider,
  jwtInterceptorProvider
} from 'projects/auth/src/public-api';
import { AppCommonModule } from 'projects/app-common/src/public-api';
import { AuthComponent } from './components/auth/auth.component';

@NgModule({
  declarations: [AppComponent, HomeComponent, HeaderComponent, AuthComponent],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppCommonModule,
    AuthModule
  ],
  providers: [jwtInterceptorProvider, errorInterceptorProvider],
  bootstrap: [AppComponent]
})
export class AppModule {}
