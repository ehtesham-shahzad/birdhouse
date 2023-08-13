import { Test, TestingModule } from '@nestjs/testing';
import { BirdhouseService } from './birdhouse.service';
import { BirdhouseRepository } from './repositories/birdhouse.repository';
import { ResidenceHistoryRepository } from './repositories/residenceHistory.repository';
import { CreateBirdhouseRequestDto } from './dto/create-birdhouse-request.dto';
import { CreateBirdhouseResponseDto } from './dto/create-birdhouse-response.dto';
import { v4 as uuidv4 } from 'uuid';
import { assert } from 'console';
import { Birdhouse } from './entities/birdhouse.entity';
import { ResidenceHistory } from './entities/residence-history.entity';

describe('BirdhouseService', () => {
  let birdhouseService: BirdhouseService;
  let birdhouseRepository: BirdhouseRepository;
  let residenceHistoryRepository: ResidenceHistoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BirdhouseService,
        {
          provide: BirdhouseRepository,
          useValue: {},
        },
        {
          provide: ResidenceHistoryRepository,
          useValue: {},
        },
      ],
    }).compile();

    birdhouseService = module.get<BirdhouseService>(BirdhouseService);
    birdhouseRepository = module.get<BirdhouseRepository>(BirdhouseRepository);
    residenceHistoryRepository = module.get<ResidenceHistoryRepository>(ResidenceHistoryRepository);
  });


  describe('createBirdhouseObj', () => {
    it('should create a birdhouse object with the given dto', () => {
      const mockDto = new CreateBirdhouseRequestDto();
      mockDto.name = 'Test Birdhouse';
      mockDto.longitude = 10.0;
      mockDto.latitude = 20.0;
      const birdhouse = birdhouseService.createBirdhouseObj(mockDto);

      expect(birdhouse.name).toBe(mockDto.name);
      expect(birdhouse.longitude).toBe(mockDto.longitude);
      expect(birdhouse.latitude).toBe(mockDto.latitude);

      expect(birdhouse.id).toBeDefined();
      expect(birdhouse.ubid).toBeDefined();
    });
  });

  describe('createResidenceHistoryObj', () => {

    it('should create a residence history object with birds and eggs', () => {
      const birdHouseId = uuidv4();
      const birds = 5;
      const eggs = 5;

      const residenceHistory = birdhouseService.createResidenceHistoryObj(birdHouseId, birds, eggs);
      expect(residenceHistory.birdHouseId).toBe(birdHouseId);
      expect(residenceHistory.birds).toBe(birds);
      expect(residenceHistory.eggs).toBe(eggs);
    });

    it('should create a residence history object', () => {
      const birdHouseId = uuidv4();

      const residenceHistory = birdhouseService.createResidenceHistoryObj(birdHouseId);
      expect(residenceHistory.birdHouseId).toBe(birdHouseId);
      expect(residenceHistory.birds).toBe(0);
      expect(residenceHistory.eggs).toBe(0);
    });

  });

  describe('birdhouseResponse', () => {
    it('it should create a response from Birdhouse and ResidenceHistory objects', () => {

      const mockBirdhouse = {
        id: uuidv4(),
        ubid: uuidv4(),
        name: 'Twitter',
        latitude: 21.234,
        longitude: 21.222,
      } as Birdhouse;

      const mockResidenceHistory = {
        birdHouseId: uuidv4(),
        birds: 2,
        eggs: 1
      } as ResidenceHistory;

      const birdhouseResponse = birdhouseService.birdhouseResponse(mockBirdhouse, mockResidenceHistory);

      expect(birdhouseResponse).toBeDefined();
      expect(birdhouseResponse.name).toBe('Twitter');
      expect(birdhouseResponse.id).toBeDefined();
      expect(birdhouseResponse.ubid).toBeDefined();
      expect(birdhouseResponse.eggs).toBe(1);
      expect(birdhouseResponse.birds).toBe(2);
      expect(birdhouseResponse.latitude).toBe(21.234);
      expect(birdhouseResponse.longitude).toBe(21.222);

    });
  });

});