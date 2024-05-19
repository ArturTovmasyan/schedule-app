import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ErrorResponse} from "../../interfaces/error/error-response.interface";
import {BroadcasterService, ValidationService} from "../../../shared/services";
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
    }, {validator: ValidationService.passwordsEqualValidator})
  }

  setNewPassword() {
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
