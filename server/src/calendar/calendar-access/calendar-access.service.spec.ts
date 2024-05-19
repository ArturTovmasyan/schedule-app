import { Test, TestingModule } from '@nestjs/testing';
import { CalendarAccessService } from './calendar-access.service';

describe('CalendarAccessService', () => {
  let service: CalendarAccessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalendarAccessService],
    }).compile();

    service = module.get<CalendarAccessService>(CalendarAccessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
