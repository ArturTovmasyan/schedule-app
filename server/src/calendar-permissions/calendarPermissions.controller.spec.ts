import { Test, TestingModule } from '@nestjs/testing';
import { CalendarPermissionsController } from './calendarPermissions.controller';

describe('CalendarPermissionsController', () => {
  let controller: CalendarPermissionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalendarPermissionsController],
    }).compile();

    controller = module.get<CalendarPermissionsController>(CalendarPermissionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
