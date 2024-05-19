import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MsCalendarComponent } from './ms-calendar.component';

describe('MsCalendarComponent', () => {
  let component: MsCalendarComponent;
  let fixture: ComponentFixture<MsCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MsCalendarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MsCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
