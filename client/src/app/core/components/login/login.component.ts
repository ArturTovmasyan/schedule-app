import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import {ValidationService} from "../../services/validation/validation.service";

@Component({
  selector: 'lib-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  submitted = false;
  returnUrl: string;
  errorMessage: any;
  error: any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.form = this.formBuilder.group({
      email: ['', [ValidationService.emailValidator, Validators.required]],
      password: ['', [ValidationService.passwordValidator, Validators.required]],
      remember: [false]
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  ngOnInit(): void {
    this.authService.logout();
  }

  get f(): any {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
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
