import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../../../services/auth/auth.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-oauth-login',
  templateUrl: './oauth-login.component.html'
})
export class OauthLoginComponent implements OnInit {

  constructor(private authService: AuthService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit(): void {
    this.loginOauthUser();
  }

  loginOauthUser() {
    debugger;
    const token = this.route.snapshot.queryParams['token'];
    const customerId = this.route.snapshot.queryParams['customerId'];
    localStorage.setItem('cu', JSON.stringify({accessToken: token, customerId}));
    this.router.navigate(['/']);
  }
}
