import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingAvailabilityComponent } from './onboarding-availability.component';

describe('OnboardingAvailabilityComponent', () => {
  let component: OnboardingAvailabilityComponent;
  let fixture: ComponentFixture<OnboardingAvailabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnboardingAvailabilityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
