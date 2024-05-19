import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'lib-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  returnUrl: string;
  error = '';

  emailError = ""
  passwordError = ""

  get hasPasswordError(): boolean {
    return false
  }

  get hasEmailError(): boolean {
    return false
  }

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      remember: [false]
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  ngOnInit(): void {
    this.authService.logout();
  }

  get f(): any {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.authService
      .login(this.f.email.value, this.f.password.value)
      .pipe(first())
      .subscribe({
        next: (data) => {
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.error = error;
        }
      });
  }
}
