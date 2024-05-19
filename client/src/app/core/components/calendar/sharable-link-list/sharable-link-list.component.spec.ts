import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharableLinkListComponent } from './sharable-link-list.component';

describe('SharableLinkListComponent', () => {
  let component: SharableLinkListComponent;
  let fixture: ComponentFixture<SharableLinkListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SharableLinkListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SharableLinkListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
