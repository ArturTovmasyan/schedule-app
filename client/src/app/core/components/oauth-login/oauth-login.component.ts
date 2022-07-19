import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../services/auth/auth.service";
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
    const token = this.route.snapshot.queryParams['token'];
    localStorage.setItem('cu', JSON.stringify({accessToken: token}));
    this.router.navigate(['/']);
  }
}
