import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectCalendarComponent } from './connect-calendar.component';

describe('ConnectCalendarComponent', () => {
  let component: ConnectCalendarComponent;
  let fixture: ComponentFixture<ConnectCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectCalendarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
