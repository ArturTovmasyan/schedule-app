import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ErrorResponse} from "../../interfaces/error/error-response.interface";
import {ValidationService} from "../../../shared/services";
import {AuthService} from "../../services/auth/auth.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-recovery-password',
  templateUrl: './recovery-password.component.html',
  styleUrls: ['./recovery-password.component.scss']
})
export class RecoveryPasswordComponent {

  form: FormGroup;
  changed = false;
  error?: ErrorResponse;
  errorMessage: string | undefined;
  readonly confirmToken: string = '';
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.confirmToken = this.route.snapshot.queryParams['token'];

    this.form = this.formBuilder.group({
      'newPassword': ['', [ValidationService.passwordValidator, Validators.required]],
      'confirmPassword': ['', [Validators.required]]
    },
      {updateOn: 'blur', validator: ValidationService.passwordsEqualValidator})
  }

  toggleNewPasswordType() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordType() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  setNewPassword() {

    if (this.form.invalid) {
      return;
    }

    this.authService
      .setNewPassword(this.confirmToken, this.form.value.newPassword)
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
