import { Test, TestingModule } from '@nestjs/testing';
import { SharableLinksService } from './sharable-links.service';

describe('SharableLinksService', () => {
  let service: SharableLinksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SharableLinksService],
    }).compile();

    service = module.get<SharableLinksService>(SharableLinksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
