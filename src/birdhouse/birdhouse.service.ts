import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CreateBirdhouseRequestDto } from './dto/create-birdhouse-request.dto';
import { CreateBirdhouseResponseDto } from './dto/create-birdhouse-response.dto';
import { UpdateBirdhouseDto } from './dto/update-birdhouse.dto';
import { UpdateOccupancyDto } from './dto/update-occupancy.dto';
import { Birdhouse } from './entities/birdhouse.entity';
import { ResidenceHistory } from './entities/residence-history.entity';
import { EmptyObjectException } from './exceptions/EmptyObject.exception';
import { RegistractionFailedException } from './exceptions/RegistrationFailed.exception';
import { UpdateFailedException } from './exceptions/UpdateFailed.exception';

export const soldBirdhouses: string[] = [];
@Injectable()
export class BirdhouseService {

  private logger = new Logger('BirdhouseService');

  constructor(
    @InjectRepository(Birdhouse) private readonly birdhouseRepository: Repository<Birdhouse>,
    @InjectRepository(ResidenceHistory) private readonly residenceHistoryRepository: Repository<ResidenceHistory>,
  ) { }

  onModuleInit() {
    if (soldBirdhouses.length === 0) {
      this.logger.log('Getting list of UBIDs');
      this.birdhouseRepository.find({ select: { ubid: true } })
        .then(res => {
          this.logger.verbose(`List of UBIDs: ${JSON.stringify(res)}`)
          this.logger.log('Setting UBIDs in in-memory storage');
          for (let i = 0; i < res.length; i++) {
            soldBirdhouses.push(res[i].ubid);
          }
        })
        .catch(error => {
          this.logger.error('Unable to communicate with database! Establish the connection.')
          this.logger.error(error);
        });
    }
  }

  async create(createBirdhouseDto: CreateBirdhouseRequestDto) {

    const birdhouse = new Birdhouse();
    birdhouse.id = uuidv4();
    birdhouse.ubid = uuidv4();
    birdhouse.name = createBirdhouseDto.name;
    birdhouse.longitude = createBirdhouseDto.longitude;
    birdhouse.latitude = createBirdhouseDto.latitude;
    this.logger.log(`Birdhouse object created`);

    const residenceHistory = new ResidenceHistory();
    residenceHistory.id = uuidv4();
    residenceHistory.birdHouseId = birdhouse.id;
    this.logger.log(`ResidenceHistory object created`);

    let saveBirdhouse: Birdhouse;
    let savedResidenceHistory: ResidenceHistory;
    try {
      saveBirdhouse = await this.birdhouseRepository.save(birdhouse);
      this.logger.verbose(`Birdhouse saved: ${JSON.stringify(savedResidenceHistory)}`);

      savedResidenceHistory = await this.residenceHistoryRepository.save(residenceHistory);
      this.logger.verbose(`ResidenceHistory saved: ${JSON.stringify(savedResidenceHistory)}`);
    } catch (error) {
      this.logger.error(error);
      throw new RegistractionFailedException();
    }

    this.logger.log('Updating in-memory list of ubids with the newly created birdhouse.');
    soldBirdhouses.push(saveBirdhouse.ubid);

    return this.birdhouseResponse(saveBirdhouse, savedResidenceHistory);

  }

  async update(ubid: string, updateBirdhouseDto: UpdateBirdhouseDto) {

    if (Object.keys(updateBirdhouseDto).length === 0) {
      this.logger.error(`Object 'updateBirdhouseDto' is empty: ${JSON.stringify(updateBirdhouseDto)}`);
      throw new EmptyObjectException();
    }

    const birdhouse = await this.birdhouseRepository.findOne({ where: { ubid }, select: { id: true } });

    if (!birdhouse) {
      this.logger.error('Birdhouse not found');
      throw new NotFoundException(`Birdhouse with ubid ${ubid} not found`);
    }

    updateBirdhouseDto.updatedAt = new Date();

    try {
      const update = await this.birdhouseRepository.update(birdhouse.id, updateBirdhouseDto);
      this.logger.verbose(`Birdhouse updated: ${JSON.stringify(update)}`);
    } catch (error) {
      this.logger.error(error);
      throw new UpdateFailedException();
    }

    this.logger.log('Retrieving updated results');
    const [updatedResult, residenceHistory] = await Promise.all([
      this.birdhouseRepository.findOne({
        where: { id: birdhouse.id },
        select: { longitude: true, latitude: true, name: true }
      }),
      this.residenceHistoryRepository.findOne({
        where: { birdHouseId: birdhouse.id },
        select: { birds: true, eggs: true, createdAt: true },
        order: { createdAt: 'DESC' },
      }),
    ]);

    return this.birdhouseResponse(updatedResult, residenceHistory);

  }

  async updateOccupancy(ubid: string, updateOccupancyDto: UpdateOccupancyDto) {

    if (Object.keys(updateOccupancyDto).length === 0) {
      this.logger.error(`Object 'updateOccupancyDto' is empty: ${JSON.stringify(updateOccupancyDto)}`);
      throw new EmptyObjectException();
    }

    const residenceHistory = await this.findResidenceHistory(ubid);

    if (!residenceHistory) {
      this.logger.error(`Birdhouse not found`);
      throw new NotFoundException(`Birdhouse with ubid ${ubid} not found`);
    }

    const updateResidenceHistory = new ResidenceHistory();
    updateResidenceHistory.id = uuidv4();
    updateResidenceHistory.birdHouseId = residenceHistory.birdHouseId;
    updateResidenceHistory.birds = updateOccupancyDto.birds ? updateOccupancyDto.birds : residenceHistory.birds;
    updateResidenceHistory.eggs = updateOccupancyDto.eggs ? updateOccupancyDto.eggs : residenceHistory.eggs;
    this.logger.log(`ResidenceHistory object created`);

    try {
      const update = await this.residenceHistoryRepository.save(updateResidenceHistory);
      this.logger.verbose(`Updating residance history. New data: ${JSON.stringify(update)}`);
    } catch (error) {
      this.logger.error(error);
      throw new UpdateFailedException()
    }

    return this.birdhouseResponse(residenceHistory.birdhouse, updateResidenceHistory);

  }

  async findOne(ubid: string) {
    const residenceHistory = await this.findResidenceHistory(ubid);

    if (!residenceHistory) {
      this.logger.error(`Birdhouse not found`);
      throw new NotFoundException('House not found');
    }

    return this.birdhouseResponse(residenceHistory.birdhouse, residenceHistory);
  }

  async findResidenceHistory(ubid: string) {
    this.logger.log('Finding birdhouse and recent residence history');
    const residenceHistory = await this.residenceHistoryRepository.findOne({
      where: { birdhouse: { ubid } },
      select: {
        id: true,
        birds: true,
        eggs: true,
        createdAt: true,
        birdHouseId: true,
        birdhouse: { latitude: true, longitude: true, name: true }
      },
      relations: { birdhouse: true },
      order: { createdAt: 'DESC' }
    });

    return residenceHistory;
  }

  async birdhouseResponse(birdhouse: Birdhouse, residenceHistory: ResidenceHistory) {

    this.logger.log(`Create a response object`);
    const response = new CreateBirdhouseResponseDto();
    if (birdhouse.id) {
      response.id = birdhouse.id;
    }
    if (birdhouse.ubid) {
      response.ubid = birdhouse.ubid;
    }
    response.longitude = birdhouse.longitude;
    response.latitude = birdhouse.latitude;
    response.name = birdhouse.name;
    response.birds = residenceHistory.birds;
    response.eggs = residenceHistory.eggs;

    this.logger.verbose(`Returning response: ${response}`);

    return response;
  }

  async residenceHistory(ubid: string) {

    const [birdhouse, residenceHistory] = await Promise.all([
      this.birdhouseRepository.findOne({
        where: { ubid },
        select: { name: true, latitude: true, longitude: true }
      }),
      this.residenceHistoryRepository.find({
        where: { birdhouse: { ubid } },
        select: {
          eggs: true,
          birds: true,
          birdhouse: { id: false },
          createdAt: true
        },
        relations: { birdhouse: true },
        order: { createdAt: 'DESC' }
      })
    ]);

    return {
      birdhouse,
      residenceHistory
    };

  }

}
