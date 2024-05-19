import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChipEmailInputComponent } from './chip-email-input.component';

describe('ChipEmailInputComponent', () => {
  let component: ChipEmailInputComponent;
  let fixture: ComponentFixture<ChipEmailInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChipEmailInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChipEmailInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
