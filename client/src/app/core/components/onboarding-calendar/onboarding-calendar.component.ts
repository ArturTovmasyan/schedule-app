import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-onboarding-calendar',
  templateUrl: './onboarding-calendar.component.html',
  styleUrls: ['./onboarding-calendar.component.scss']
})
export class OnboardingCalendarComponent implements OnInit {

  constructor(
    private router: Router
  ) {
  }

  ngOnInit(): void {
  }

  next() {
    this.router.navigate(['/onboarding/configuration']);
  }
}
