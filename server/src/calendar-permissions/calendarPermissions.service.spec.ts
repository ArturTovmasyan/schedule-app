import { Test, TestingModule } from '@nestjs/testing';
import { CalendarPermissionsService } from './calendarPermissions.service';

describe('CalendarPermissionsService', () => {
  let service: CalendarPermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalendarPermissionsService],
    }).compile();

    service = module.get<CalendarPermissionsService>(CalendarPermissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
