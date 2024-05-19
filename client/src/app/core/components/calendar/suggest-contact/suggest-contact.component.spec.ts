import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestContactComponent } from './suggest-contact.component';

describe('SuggestContactComponent', () => {
  let component: SuggestContactComponent;
  let fixture: ComponentFixture<SuggestContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuggestContactComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SuggestContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
