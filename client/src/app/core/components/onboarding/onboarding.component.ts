import {Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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
  currentNavIndex = 0;
  isAtFirstPage = true;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ) {

  }

  ngOnInit(): void {
    this.navOptions.forEach((nav, index) => {
      if(nav.route === `/onboarding/${this.activatedRoute.firstChild?.snapshot?.url[0].path}`) {
        this.navigate(index);
      }
    });
  }

  navigate(index: number) {
    this.onboard_title = this.navOptions[index].title;
    this.isAtFirstPage = index == 0;
    this.currentNavIndex = index;
  }

  navigateNext() {
    if(this.currentNavIndex == 3) {
      this.router.navigate(['/calendar/suggest-contact']);
    } else {
      this.navigate(++this.currentNavIndex);
      this.router.navigate([this.navOptions[this.currentNavIndex].route]);
    }
  }

  navigateBack() {
    if(this.currentNavIndex == 0) {
      return;
    }
    this.navigate(--this.currentNavIndex);
    this.router.navigate([this.navOptions[this,this.currentNavIndex].route]);
  }
}

interface NavOption {
  id: string;
  title: string;
  route: string;
}
