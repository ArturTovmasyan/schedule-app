import {Component, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth/auth.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ValidationService} from "../../../shared/services";
import {ErrorResponse} from "../../interfaces/error/error-response.interface";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  form: FormGroup;
  fullName: string | undefined;
  firstName: string | undefined;
  email: string | undefined;
  password: string | undefined;
  showPassword: boolean = false;
  register = false;
  showRequiredErrors = false;
  error?: ErrorResponse;
  @ViewChild("focusField") focusField:any;

  constructor(private authService: AuthService, private router: Router, private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
        fullName: ['', [ValidationService.fullNameValidator, Validators.required]],
        email: ['', [ValidationService.emailValidator, Validators.required]],
        password: ['', [ValidationService.passwordValidator, Validators.required]]
      },
      {updateOn: 'blur'}
    );
  }

  get f() {
    return this.form.controls;
  }

  signup() {
    if (this.form.invalid) {
      // this.focusField.nativeElement.focus();
      this.showRequiredErrors = true;

      return;
    }

    // generate first and last names
    const splitData = this.form.value.fullName.split(' ');
    const firstName = splitData[0];
    splitData.shift();
    const lastName = splitData.join(' ');
    this.email = this.form.value.email;

    const data = {
      'firstName': firstName,
      'lastName': lastName,
      'email': this.email,
      'password': this.form.value.password
    };

    this.authService.signup(data)
      .subscribe({
        next: () => {
          this.register = true;
          this.form.reset();
        },
        error: (error) => {
          this.error = error;
        }
      })
  }

  googleLogin() {
    window.location.href = environment.host + "api/auth/google";
  }

  microsoftLogin() {
    window.location.href = environment.host + "api/auth/microsoft";
  }

  togglePasswordType() {
    this.showPassword = !this.showPassword;
  }
}
