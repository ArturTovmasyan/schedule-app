import { Component, Input, OnInit } from '@angular/core';
import {BroadcasterService} from "../../../shared/services";

const STANDARD_PLAN = 0;
const PROFESSIONAL_PLAN = 1;

@Component({
  selector: 'app-subscription-plan-item',
  templateUrl: './subscription-plan-item.component.html',
  styleUrls: ['./subscription-plan-item.component.scss']
})
export class SubscriptionPlanItemComponent implements OnInit {

  @Input('subscription-plan')
  subscriptionPlan!: {
    name: string;
    price: number;
    isMonthly: boolean;
    description: string;
    features: string[];
    recommended: boolean;
    icons: {
      normal: string;
      selected: string;
    };
  };

  @Input() isSelected = false;

  ngOnInit(): void {
  }

  constructor(private broadcaster: BroadcasterService) {
  }

  get iconPath(): string {
    return `/assets/${this.isSelected ? this.subscriptionPlan.icons.selected : this.subscriptionPlan.icons.normal}`;
  }

  selectPlan() {
    this.isSelected = true;
    this.broadcaster.broadcast('plan_type', this.subscriptionPlan.recommended ? STANDARD_PLAN : PROFESSIONAL_PLAN);
    console.log(this.subscriptionPlan);
  }
}
