import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChipUserItemComponent } from './chip-user-item.component';

describe('ChipUserItemComponent', () => {
  let component: ChipUserItemComponent;
  let fixture: ComponentFixture<ChipUserItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChipUserItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChipUserItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
