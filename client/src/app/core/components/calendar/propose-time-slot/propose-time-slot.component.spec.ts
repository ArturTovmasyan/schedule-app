import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProposeTimeSlotComponent } from './propose-time-slot.component';

describe('ProposaeTimeSlotComponent', () => {
  let component: ProposeTimeSlotComponent;
  let fixture: ComponentFixture<ProposeTimeSlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProposeTimeSlotComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProposeTimeSlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
