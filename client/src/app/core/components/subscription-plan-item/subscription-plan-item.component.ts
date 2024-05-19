import { Component, Input, OnInit } from '@angular/core';
import {BroadcasterService} from "../../../shared/services";
import {PROFESSIONAL_PLAN, STANDARD_PLAN} from "../../interfaces/constant/payment.constant";

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
    const plan = this.subscriptionPlan.recommended ? STANDARD_PLAN : PROFESSIONAL_PLAN;
    this.broadcaster.broadcast('plan_type', plan);
    localStorage.setItem('plan', this.subscriptionPlan.name.toLowerCase());
  }
}
