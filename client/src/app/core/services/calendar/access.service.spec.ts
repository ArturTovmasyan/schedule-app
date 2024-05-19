import { TestBed } from '@angular/core/testing';

import { CalendarAccessService } from './access.service';

describe('RequestShareService', () => {
  let service: CalendarAccessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalendarAccessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
