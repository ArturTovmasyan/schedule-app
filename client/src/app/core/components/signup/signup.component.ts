import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../services/auth/auth.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ValidationService} from "../../services/validation/validation.service";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  form: FormGroup;
  fullName: string = '';
  firstName: string = '';
  email: string = '';
  password: string = '';
  error: string = '';
  homePageUrl: string = '/';
  errorMessage: any;

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router, private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      fullName: ['', [ValidationService.fullNameValidator, Validators.required]],
      email: ['', [ValidationService.emailValidator, Validators.required]],
      password: ['', [ValidationService.passwordValidator, Validators.required]],
    });
  }

  ngOnInit() {
    if (this.form.invalid) {
      return;
    }
  }

  get f(): any {
    return this.form.controls;
  }

  signup() {

    let splitData = this.form.value.fullName.split(' ');
    let firstName = splitData[0];
    splitData.shift();
    let lastName = splitData.join(' ');

    splitData.shift();

    let data = {
      'firstName': firstName,// assume full name is 2 part
      'lastName': lastName,
      'email': this.form.value.email,
      'password': this.form.value.password,
    };

    this.authService.signup(data).subscribe(
      res => {
        this.router.navigate([this.homePageUrl]);
      },
      error => {
        this.error = error.message;
      }
    );
  }
}
