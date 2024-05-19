import {Component, OnInit} from '@angular/core';
import {SettingService} from "../../services/setting/setting.service";
import {Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ValidationService} from "../../../shared/services";
import {ErrorResponse} from "../../interfaces/error/error-response.interface";
import {AuthService} from "../../services/auth/auth.service";

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  form: FormGroup;
  error?: ErrorResponse|null;
  errorMessage: undefined;
  showCurrentPassword = true;
  currentPasswordOption = [];

  constructor(private settingService: SettingService, private router: Router, private formBuilder: FormBuilder, private authService: AuthService) {
    this.form = this.formBuilder.group({
      'currentPassword': ['', this.currentPasswordOption],
      'newPassword': ['', [ValidationService.passwordValidator, Validators.required]],
      'confirmPassword': ['', [Validators.required]]
    }, {validator: ValidationService.passwordsEqualValidator})

  }

  ngOnInit(): void {
    this.authService.hasAccess().subscribe({
      next: ({ isActive, user }) => {
        if (user && isActive) {
          if (user.provider) {
            this.showCurrentPassword = false;
            this.currentPasswordOption = [];
          }
        }
      }
    });
  }

  changePassword() {

    if (this.form.invalid) {
      return;
    }

    this.settingService
      .changePassword(this.form.value)
      .subscribe({
        next: () => {
          this.form.clearValidators();
          this.form.reset();
          this.error = null;

          alert('Your password successfully changed')
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  get f() {
    return this.form.controls;
  }
}
