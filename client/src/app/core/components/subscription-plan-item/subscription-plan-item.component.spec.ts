import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionPlanItemComponent } from './subscription-plan-item.component';

describe('SubscriptionPlanComponent', () => {
  let component: SubscriptionPlanItemComponent;
  let fixture: ComponentFixture<SubscriptionPlanItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubscriptionPlanItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionPlanItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
