import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChipUserInputComponent } from './chip-user-input.component';

describe('ChipUserInputComponent', () => {
  let component: ChipUserInputComponent;
  let fixture: ComponentFixture<ChipUserInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChipUserInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChipUserInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
