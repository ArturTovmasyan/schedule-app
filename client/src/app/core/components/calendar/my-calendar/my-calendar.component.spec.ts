import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCalendarComponent } from './my-calendar.component';

describe('FullCalendarComponent', () => {
  let component: MyCalendarComponent;
  let fixture: ComponentFixture<MyCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyCalendarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
