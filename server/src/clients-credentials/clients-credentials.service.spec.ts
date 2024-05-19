import { Test, TestingModule } from '@nestjs/testing';
import { ClientsCredentialsService } from './clients-credentials.service';

describe('ClientsCredentialsService', () => {
  let service: ClientsCredentialsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientsCredentialsService],
    }).compile();

    service = module.get<ClientsCredentialsService>(ClientsCredentialsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
