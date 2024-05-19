import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth/auth.service";
import {BroadcasterService, ValidationService} from "../../../shared/services";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  form: FormGroup;
  submitted = false;
  errorMessage: string | undefined;
  email: string |undefined;
  error: any;

  constructor(
    private formBuilder: FormBuilder,
    private broadcaster: BroadcasterService,
    private authService: AuthService
  ) {
    this.form = this.formBuilder.group({
      email: ['', [ValidationService.emailValidator, Validators.required]]
    });
  }

  ngOnInit(): void {
    this.broadcaster.broadcast('isLoginPage', false);
  }

  resetPassword() {
    //TODO send reset password email here!
    if (this.form.invalid) {
      return;
    }

    this.authService
      .checkEmail(this.form.value.email)
      .subscribe({
        next: () => {
          this.submitted = true;
          this.email = this.form.value.email;
        },
        error: (error) => {
          this.error = error;
        }
      });
  }
}
