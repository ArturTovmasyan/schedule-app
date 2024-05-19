import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProposaeTimeSlotComponent } from './proposae-time-slot.component';

describe('ProposaeTimeSlotComponent', () => {
  let component: ProposaeTimeSlotComponent;
  let fixture: ComponentFixture<ProposaeTimeSlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProposaeTimeSlotComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProposaeTimeSlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
