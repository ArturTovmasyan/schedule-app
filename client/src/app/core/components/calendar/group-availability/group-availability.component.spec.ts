import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAvailabilityComponent } from './group-availability.component';

describe('GroupAvailabilityComponent', () => {
  let component: GroupAvailabilityComponent;
  let fixture: ComponentFixture<GroupAvailabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupAvailabilityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
