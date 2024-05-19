import { Test, TestingModule } from '@nestjs/testing';
import { CalendarAccessibilityController } from './calendar-accessibility.controller';
import { CalendarAccessibilityService } from './calendar-accessibility.service';

describe('CalendarAccessibilityController', () => {
  let controller: CalendarAccessibilityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalendarAccessibilityController],
      providers: [CalendarAccessibilityService],
    }).compile();

    controller = module.get<CalendarAccessibilityController>(CalendarAccessibilityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
