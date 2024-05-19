import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding-configuration',
  templateUrl: './onboarding-configuration.component.html',
  styleUrls: ['./onboarding-configuration.component.scss']
})
export class OnboardingConfigurationComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  next() {
    this.router.navigate(['/onboarding/availability']);
  }

  back() {
    this.router.navigate(['/onboarding/calendar']);
  }
}

