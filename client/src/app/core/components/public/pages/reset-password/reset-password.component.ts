import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../../../services/auth/auth.service";
import {BroadcasterService, ValidationService} from "../../../../../shared/services";
import {ErrorResponse} from "../../../../interfaces/error/error-response.interface";

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
  error?: ErrorResponse;
  showRequiredErrors = false;

  @ViewChild("focusField") focusField:any;

  constructor(
    private formBuilder: FormBuilder,
    private broadcaster: BroadcasterService,
    private authService: AuthService
  ) {
    this.form = this.formBuilder.group({
      email: ['', [ValidationService.emailValidator, Validators.required]]
    }, {updateOn: 'blur'}
      );
  }

  ngOnInit(): void {
    this.broadcaster.broadcast('isAuthPage', true);
  }

  resetPassword() {
    if (this.form.invalid) {
      this.focusField.nativeElement.focus();
      this.showRequiredErrors = true;
      return;
    }

    this.authService
      .resetPassword(this.form.value.email)
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
