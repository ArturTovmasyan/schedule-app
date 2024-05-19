import { Test, TestingModule } from '@nestjs/testing';
import { CalendarEventController } from './calendar-event.controller';

describe('CalendarController', () => {
  let controller: CalendarEventController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalendarEventController],
    }).compile();

    controller = module.get<CalendarEventController>(CalendarEventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
