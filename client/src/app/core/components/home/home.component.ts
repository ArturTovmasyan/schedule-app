import {Component, OnInit} from '@angular/core';
import {BroadcasterService} from "../../../shared/services";
import {Router} from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit
{
  public fullName = '';

  constructor(private broadcaster: BroadcasterService, private router: Router) {

    const userData = localStorage.getItem('cu');

    if (userData) {
      const user = JSON.parse(userData);
      this.fullName = user.first

      // if (user && !user.user.stripeCustomerId) {
        this.router.navigate(['/onboarding/subscription-plan'])
      // }
    }
  }

  ngOnInit(): void {
    this.broadcaster.broadcast('logged', true);
  }
}
