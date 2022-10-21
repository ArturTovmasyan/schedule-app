import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent implements OnInit {

  navOptions: NavOption[] = [
    {
      id: 'calendar-setup',
      title: 'Calendar Setup',
      route: '/onboarding/calendar'
    },
    {
      id: 'configuration',
      title: 'Configuration',
      route: '/onboarding/configuration'
    },
    {
      id: 'availability',
      title: 'Availability',
      route: '/onboarding/availability'
    },
    {
      id: 'account-info',
      title: 'Account & Profile',
      route: '/onboarding/account-info'
    }
  ];

  onboard_title = this.navOptions[0]['title'];

  ngOnInit(): void {
  }

  changeTitle(title: string) {
    this.onboard_title = title;
  }
}

interface NavOption {
  id: string;
  title: string;
  route: string;
}
