import { Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ErrorResponse} from "../../interfaces/error/error-response.interface";
import {BroadcasterService, ValidationService} from "../../../shared/services";
import {AuthService} from "../../services/auth/auth.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {

  form: FormGroup;
  changed = false;
  error?: ErrorResponse;
  errorMessage: string | undefined;
  readonly confirmToken: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private broadcaster: BroadcasterService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.confirmToken = this.route.snapshot.queryParams['token'];

    this.form = this.formBuilder.group({
      'newPassword': ['', [ValidationService.passwordValidator, Validators.required]],
      'confirmPassword': ['', [Validators.required]]
    },  {validator: ValidationService.passwordsEqualValidator})
  }

  changePassword() {
      this.authService
        .changePassword(this.confirmToken, this.form.value.newPassword)
        .subscribe({
          next: () => {
            this.form.clearValidators();
            this.form.reset();
            this.changed = true;
          },
          error: (error) => {
            this.error = error;
          }
        });
  }
}
