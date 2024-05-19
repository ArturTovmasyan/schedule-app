import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-subscription-plan',
  templateUrl: './subscription-plan.component.html',
  styleUrls: ['./subscription-plan.component.scss']
})
export class SubscriptionPlanComponent implements OnInit {

  subscriptionPlans = [
    {
      name: 'Standard',
      price: 5,
      isMonthly: true,
      description: 'For individuals and small teams looking for more integrations and customizations',
      features: [
        'Lorem ipsum dolor',
        'Sit amet sapien porttitor',
        'Posuere netus ullamcorper',
        'Feugiat tristique eu magna urna augue ultrices nec dapibus',
        'Proin mauris posuere rhoncus'
      ],
      icons: {
        normal: 'ic_plan_standard.svg',
        selected: 'ic_plan_standard_selected.svg'
      },
      recommended: true
    },
    {
      name: 'Professional',
      price: 20,
      isMonthly: false,
      description: 'For teams and companies that want to collaborate more efficiently.',
      features: [
        'Lorem ipsum dolor',
        'Sit amet sapien porttitor',
        'Posuere netus ullamcorper',
        'Feugiat tristique eu magna urna augue ultrices nec dapibus',
        'Proin mauris posuere rhoncus'
      ],
      icons: {
        normal: 'ic_plan_professional.svg',
        selected: 'ic_plan_professional_selected.svg'
      },
      recommended: false
    }
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
