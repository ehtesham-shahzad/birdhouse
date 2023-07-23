import { Test, TestingModule } from '@nestjs/testing';
import { BirdhouseService } from './birdhouse.service';

describe('BirdhouseService', () => {
  let service: BirdhouseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BirdhouseService],
    }).compile();

    service = module.get<BirdhouseService>(BirdhouseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
