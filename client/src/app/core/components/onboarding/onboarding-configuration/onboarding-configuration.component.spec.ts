import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingConfigurationComponent } from './onboarding-configuration.component';

describe('OnboardingConfigurationComponent', () => {
  let component: OnboardingConfigurationComponent;
  let fixture: ComponentFixture<OnboardingConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnboardingConfigurationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
