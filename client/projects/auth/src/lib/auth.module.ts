import { NgModule } from '@angular/core';
import { AppCommonModule } from 'projects/app-common/src/public-api';
import { LoginComponent } from './components/login/login.component';

@NgModule({
  declarations: [LoginComponent],
  imports: [AppCommonModule],
  exports: [LoginComponent],
})
export class AuthModule {}
