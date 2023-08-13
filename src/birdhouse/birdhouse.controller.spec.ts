import { Test, TestingModule } from '@nestjs/testing';
import { BirdhouseController } from './birdhouse.controller';
import { BirdhouseService } from './birdhouse.service';
import { BirdhouseRepository } from './repositories/birdhouse.repository';
import { ResidenceHistoryRepository } from './repositories/residenceHistory.repository';
import { v4 as uuidv4 } from 'uuid';
import { CreateBirdhouseRequestDto } from './dto/create-birdhouse-request.dto';
import { UpdateBirdhouseDto } from './dto/update-birdhouse.dto';
import { UpdateOccupancyDto } from './dto/update-occupancy.dto';
import { Birdhouse } from './entities/birdhouse.entity';
import { ResidenceHistory } from './entities/residence-history.entity';

describe('BirdhouseController', () => {
  let controller: BirdhouseController;
  let service: BirdhouseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BirdhouseController],
      providers: [BirdhouseService,
        {
          provide: BirdhouseRepository,
          useValue: {},
        },
        {
          provide: ResidenceHistoryRepository,
          useValue: {},
        }
      ],
    }).compile();

    controller = module.get<BirdhouseController>(BirdhouseController);
    service = module.get<BirdhouseService>(BirdhouseService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new birdhouse', async () => {
      const mockCreateBirdhouseDto: CreateBirdhouseRequestDto = {
        name: 'Twitter',
        latitude: 12.344,
        longitude: 31.122
      };

      service.create = jest.fn().mockResolvedValue({ id: 1, ...mockCreateBirdhouseDto });

      const result = await controller.create(mockCreateBirdhouseDto);

      expect(result).toEqual({ id: 1, ...mockCreateBirdhouseDto });
      expect(service.create).toHaveBeenCalledWith(mockCreateBirdhouseDto);
    });
  });

  describe('createInBulk', () => {
    it('should create birdhouses in bulk and return the results', async () => {
      const mockCreateBirdhousesDto: CreateBirdhouseRequestDto[] = [
        {
          name: 'Twitter',
          latitude: 12.344,
          longitude: 31.122
        },
        {
          name: 'X',
          latitude: 12.344,
          longitude: 31.122
        }
      ];

      service.createInBulk = jest.fn().mockResolvedValue([{ id: 1, ...mockCreateBirdhousesDto[0] }]);

      const result = await controller.createInBulk(mockCreateBirdhousesDto);

      expect(result).toEqual([{ id: 1, ...mockCreateBirdhousesDto[0] }]);
      expect(service.createInBulk).toHaveBeenCalledWith(mockCreateBirdhousesDto);
    });
  });

  describe('update', () => {
    it('should update a birdhouse and return the updated data', async () => {
      const mockUbid = 'test-ubid';
      const mockUpdateBirdhouseDto: UpdateBirdhouseDto = {
        name: 'Twitter',
        longitude: 12.333,
        latitude: 11.332,
        updatedAt: new Date()
      };

      service.update = jest.fn().mockResolvedValue({ id: 1, ...mockUpdateBirdhouseDto });

      const result = await controller.update(mockUbid, mockUpdateBirdhouseDto);

      expect(result).toEqual({ id: 1, ...mockUpdateBirdhouseDto });
      expect(service.update).toHaveBeenCalledWith(mockUbid, mockUpdateBirdhouseDto);
    });
  });

  describe('updateOccupancy', () => {
    it('should update birdhouse occupancy and return the updated data', async () => {
      const mockUbid = 'test-ubid';
      const mockUpdateOccupancyDto: UpdateOccupancyDto = {
        updatedAt: new Date(),
        birds: 3,
        eggs: 8
      };

      service.updateOccupancy = jest.fn().mockResolvedValue({ id: 1, ...mockUpdateOccupancyDto });

      const result = await controller.updateOccupancy(mockUbid, mockUpdateOccupancyDto);

      expect(result).toEqual({ id: 1, ...mockUpdateOccupancyDto });
      expect(service.updateOccupancy).toHaveBeenCalledWith(mockUbid, mockUpdateOccupancyDto);
    });
  });

  describe('findOne', () => {
    it('should find and return a birdhouse', async () => {
      const mockUbid = uuidv4();
      const mockBirdhouse = { id: uuidv4(), name: 'Test Birdhouse' };

      service.findOne = jest.fn().mockResolvedValue(mockBirdhouse);

      const result = await controller.findOne(mockUbid);

      expect(result).toEqual(mockBirdhouse);
      expect(service.findOne).toHaveBeenCalledWith(mockUbid);
    });
  });

  describe('residenceHistory', () => {
    it('should get residence history of a birdhouse', async () => {
      const mockUbid = uuidv4();
      const mockResidenceHistory = {
        birdhouse: {
          id: uuidv4(),
          latitude: 21.344,
          longitude: 12.443,
          name: 'Twitter',
          ubid: mockUbid,
        },
        residenceHistory: [
          {
            id: uuidv4(),
            eggs: 3,
            birds: 1
          }
        ]
      } as {
        birdhouse: Birdhouse;
        residenceHistory: ResidenceHistory[];
      };

      service.residenceHistory = jest.fn().mockResolvedValue(mockResidenceHistory);

      const result = await controller.residenceHistory(mockUbid);

      expect(result).toEqual(mockResidenceHistory);
      expect(service.residenceHistory).toHaveBeenCalledWith(mockUbid);
    });
  });

});
