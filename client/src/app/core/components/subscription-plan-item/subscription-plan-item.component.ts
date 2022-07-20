import { Component, Input, OnInit } from '@angular/core';

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

  get iconPath(): string {
    return `/assets/${this.isSelected ? this.subscriptionPlan.icons.selected : this.subscriptionPlan.icons.normal}`;
  }
}
