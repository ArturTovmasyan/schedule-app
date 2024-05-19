import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteAndConnectComponent } from './invite-and-connect.component';

describe('InviteAndConnectComponent', () => {
  let component: InviteAndConnectComponent;
  let fixture: ComponentFixture<InviteAndConnectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InviteAndConnectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InviteAndConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
