import { Test, TestingModule } from '@nestjs/testing';
import { CalendarAccessibilityService } from './calendar-accessibility.service';

describe('CalendarAccessibilityService', () => {
  let service: CalendarAccessibilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalendarAccessibilityService],
    }).compile();

    service = module.get<CalendarAccessibilityService>(CalendarAccessibilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
