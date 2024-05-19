import {Component, OnInit} from '@angular/core';
import {SettingService} from "../../services/setting/setting.service";
import {Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ValidationService} from "../../../shared/services";
import {ErrorResponse} from "../../interfaces/error/error-response.interface";

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  form: FormGroup;
  error?: ErrorResponse;
  errorMessage: undefined;

  constructor(private settingService: SettingService, private router: Router, private formBuilder: FormBuilder) {

    this.form = this.formBuilder.group({
      'currentPassword': ['', [Validators.required]],
      'newPassword': ['', [ValidationService.passwordValidator, Validators.required]],
      'confirmPassword': ['', [Validators.required]]
    }, {validator: ValidationService.passwordsEqualValidator})

  }

  ngOnInit(): void {
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
