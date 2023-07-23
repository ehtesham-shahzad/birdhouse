import { Test, TestingModule } from '@nestjs/testing';
import { BirdhouseController } from './birdhouse.controller';
import { BirdhouseService } from './birdhouse.service';

describe('BirdhouseController', () => {
  let controller: BirdhouseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BirdhouseController],
      providers: [BirdhouseService],
    }).compile();

    controller = module.get<BirdhouseController>(BirdhouseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
