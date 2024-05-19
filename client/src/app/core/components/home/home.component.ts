import {Component, OnInit} from '@angular/core';
import {BroadcasterService} from "../../../shared/services";
import {Router} from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(private broadcaster: BroadcasterService, private router: Router) {

    const paymentSubscription = localStorage.getItem('subscribe');

    if (!paymentSubscription) {
      this.router.navigate(['/onboarding/subscription-plan'])
    }
  }

  ngOnInit(): void {
    this.broadcaster.broadcast('logged', true);
  }
}
