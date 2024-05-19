import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
  }

  get onboardingTitle(): OnboardingTitle {
    return {
      "subscription-plan": {
        primary: "Start for free.",
        secondary: "Scheduling should be easy."
      },
      "calendar": {
        primary: "Let's get you set up and connected.",
        secondary: ""
      },
      "configuration": {
        primary: "Let's get you set up and connected.",
        secondary: ""
      },
      "availability": {
        primary: "Set Your Availability",
        secondary: ""
      }
    }
  }

  get title(): { primary: string, secondary: string } {
    const routePath: string | undefined = this.activatedRoute.firstChild?.snapshot.routeConfig?.path;
    if (routePath != null) {
      return this.onboardingTitle[routePath];
    } else {
      return {
        primary: "",
        secondary: ""
      };
    }
  }  
}

interface OnboardingTitle {
  [key: string]: {
    primary: string,
    secondary: string
  }
}
