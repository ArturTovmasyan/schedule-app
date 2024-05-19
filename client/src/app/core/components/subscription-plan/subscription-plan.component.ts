import {Component, OnDestroy} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {BroadcasterService} from "../../../shared/services";
import {STANDARD_PLAN_NAME} from "../../interfaces/constant/payment.constant";

@Component({
  selector: 'app-subscription-plan',
  templateUrl: './subscription-plan.component.html',
  styleUrls: ['./subscription-plan.component.scss']
})
export class SubscriptionPlanComponent implements OnDestroy{

  selectedPlan = 0;
  subscription: BehaviorSubject<number>;

  constructor(private broadcaster: BroadcasterService) {
    this.subscription = this.broadcaster.on('plan_type').subscribe((planItem: number) => {
      this.selectedPlan = planItem;
    });

    localStorage.setItem('plan', STANDARD_PLAN_NAME);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

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
}
