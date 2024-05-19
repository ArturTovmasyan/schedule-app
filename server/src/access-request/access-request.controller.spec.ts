import { Test, TestingModule } from '@nestjs/testing';
import { AccessRequestController } from './access-request.controller';
import { AccessRequestService } from './access-request.service';

describe('AccessRequestController', () => {
  let controller: AccessRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccessRequestController],
      providers: [AccessRequestService],
    }).compile();

    controller = module.get<AccessRequestController>(AccessRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
