import { Test, TestingModule } from '@nestjs/testing';
import { SharableLinksController } from './sharable-links.controller';
import { SharableLinksService } from './sharable-links.service';

describe('SharableLinksController', () => {
  let controller: SharableLinksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SharableLinksController],
      providers: [SharableLinksService],
    }).compile();

    controller = module.get<SharableLinksController>(SharableLinksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
