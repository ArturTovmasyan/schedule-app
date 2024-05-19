import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-onboarding-availability',
  templateUrl: './onboarding-availability.component.html',
  styleUrls: ['./onboarding-availability.component.scss']
})
export class OnboardingAvailabilityComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

   back() {
    this.router.navigate(['/onboarding/configuration']);
  }

  setupLater() {
    this.router.navigate(['/onboarding/calendar']);
  }

  next() {}
}
