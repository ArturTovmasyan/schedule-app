import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoomOauthComponent } from './zoom-oauth.component';

describe('ZoomOauthComponent', () => {
  let component: ZoomOauthComponent;
  let fixture: ComponentFixture<ZoomOauthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ZoomOauthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZoomOauthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
