import { Test, TestingModule } from '@nestjs/testing';
import { CalendarAccessController } from './calendar-access.controller';
import { CalendarAccessService } from './calendar-access.service';

describe('CalendarAccessController', () => {
  let controller: CalendarAccessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalendarAccessController],
      providers: [CalendarAccessService],
    }).compile();

    controller = module.get<CalendarAccessController>(CalendarAccessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
