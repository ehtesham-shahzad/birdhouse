import { Injectable, Logger, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { isLatitude, isLongitude, isString } from 'class-validator';
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
import { BirdhouseRepository } from './repositories/birdhouse.repository';
import { ResidenceHistoryRepository } from './repositories/residenceHistory.repository';

export const soldBirdhouses: string[] = [];
@Injectable()
export class BirdhouseService {

  private logger = new Logger(BirdhouseService.name);

  constructor(
    private readonly birdhouseRepository: BirdhouseRepository,
    private readonly residenceHistoryRepository: ResidenceHistoryRepository,
  ) { }

  onModuleInit() {
    if (soldBirdhouses.length === 0) {
      this.logger.log('Getting list of UBIDs');
      this.birdhouseRepository.getBirdhouseUbids()
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

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async pruneOutdatedBirdhouses() {

    const potentialPrune: string[] = [];

    const birdhouse = await this.birdhouseRepository.getBirdhouseIdsUpdatedAt();

    const currentTime = new Date().getTime();
    const oneYear = 365 * 24 * 60 * 60 * 1000;

    for (let i = 0; i < birdhouse.length; i++) {
      if (currentTime - birdhouse[i].updatedAt.getTime() > oneYear) {
        potentialPrune.push(birdhouse[i].id);
      }
    }
    this.logger.log('potentialPrune: ', potentialPrune);

    for (let i = 0; i < potentialPrune.length; i++) {
      const residenceHistory = await this.residenceHistoryRepository.findRHIdCreatedAtByBirdhouseId(potentialPrune[i]);
      this.logger.log('residenceHistory: ', residenceHistory);

      if (currentTime - residenceHistory[0].createdAt.getTime() > oneYear) {

        for (let j = 0; j < residenceHistory.length; j++) {
          const deleteData = await this.residenceHistoryRepository.removeResidenceHistory(residenceHistory[j]);
          this.logger.log('deleteData: ', deleteData);
        }

        const deleteData = await this.birdhouseRepository.deleteBirdhouseById(potentialPrune[i]);
        this.logger.log('deleteData: ', deleteData);
      }
    }

  }

  async create(createBirdhouseDto: CreateBirdhouseRequestDto) {

    const birdhouse = this.createBirdhouseObj(createBirdhouseDto);
    const residenceHistory = this.createResidenceHistoryObj(birdhouse.id);

    let saveBirdhouse: Birdhouse;
    let savedResidenceHistory: ResidenceHistory;
    try {
      saveBirdhouse = await this.birdhouseRepository.saveBirdhouse(birdhouse);
      this.logger.verbose(`Birdhouse saved: ${JSON.stringify(savedResidenceHistory)}`);

      savedResidenceHistory = await this.residenceHistoryRepository.saveResidenceHistory(residenceHistory);
      this.logger.verbose(`ResidenceHistory saved: ${JSON.stringify(savedResidenceHistory)}`);
    } catch (error) {
      this.logger.error(error);
      throw new RegistractionFailedException();
    }

    this.logger.log('Updating in-memory list of ubids with the newly created birdhouse.');
    soldBirdhouses.push(saveBirdhouse.ubid);

    return this.birdhouseResponse(saveBirdhouse, savedResidenceHistory);

  }

  createBirdhouseObj(createBirdhouseDto: CreateBirdhouseRequestDto) {
    const birdhouse = new Birdhouse();
    birdhouse.id = uuidv4();
    birdhouse.ubid = uuidv4();
    birdhouse.name = createBirdhouseDto.name;
    birdhouse.longitude = createBirdhouseDto.longitude;
    birdhouse.latitude = createBirdhouseDto.latitude;
    this.logger.log(`Birdhouse object created`);
    return birdhouse;
  }

  createResidenceHistoryObj(birdhouseId: string, birds = 0, eggs = 0) {
    const residenceHistory = new ResidenceHistory();
    residenceHistory.id = uuidv4();
    residenceHistory.birdHouseId = birdhouseId;
    residenceHistory.birds = birds;
    residenceHistory.eggs = eggs;
    this.logger.log(`ResidenceHistory object created`);
    return residenceHistory;
  }

  async createInBulk(createBirdhousesDto: CreateBirdhouseRequestDto[]) {
    for (let i = 0; i < createBirdhousesDto.length; i++) {
      if (!isString(createBirdhousesDto[i].name) || createBirdhousesDto[i].name.length < 4 || createBirdhousesDto[i].name.length > 16) {
        throw new NotAcceptableException();
      }

      if (!isLatitude(createBirdhousesDto[i].latitude.toString()) || !isLongitude(createBirdhousesDto[i].longitude.toString())) {
        throw new NotAcceptableException();
      }
    }

    const createInBulk: CreateBirdhouseResponseDto[] = [];
    for (let i = 0; i < createBirdhousesDto.length; i++) {
      createInBulk.push(await this.create(createBirdhousesDto[i]));
    }

    return createInBulk;
  }

  async update(ubid: string, updateBirdhouseDto: UpdateBirdhouseDto) {

    if (Object.keys(updateBirdhouseDto).length === 0) {
      this.logger.error(`Object 'updateBirdhouseDto' is empty: ${JSON.stringify(updateBirdhouseDto)}`);
      throw new EmptyObjectException();
    }

    const birdhouse = await this.birdhouseRepository.findBirdhouseIdByUbid(ubid);

    if (!birdhouse) {
      this.logger.error('Birdhouse not found');
      throw new NotFoundException(`Birdhouse with ubid ${ubid} not found`);
    }

    updateBirdhouseDto.updatedAt = new Date();

    try {
      const update = await this.birdhouseRepository.updateBirdhouse(birdhouse.id, updateBirdhouseDto);
      this.logger.verbose(`Birdhouse updated: ${JSON.stringify(update)}`);
    } catch (error) {
      this.logger.error(error);
      throw new UpdateFailedException();
    }

    this.logger.log('Retrieving updated results');
    const [updatedResult, residenceHistory] = await Promise.all([
      this.birdhouseRepository.findBirdhouseNameLocationById(birdhouse.id),
      this.residenceHistoryRepository.findRHBirdsEggsCreatedAtByBirdhouseId(birdhouse.id),
    ]);

    return this.birdhouseResponse(updatedResult, residenceHistory);

  }

  async updateOccupancy(ubid: string, updateOccupancyDto: UpdateOccupancyDto) {

    if (Object.keys(updateOccupancyDto).length === 0) {
      this.logger.error(`Object 'updateOccupancyDto' is empty: ${JSON.stringify(updateOccupancyDto)}`);
      throw new EmptyObjectException();
    }

    this.logger.log('Finding birdhouse and recent residence history');
    const residenceHistory = await this.residenceHistoryRepository.findRHIdBirdsEggsCreatedAtBirdhouseIdNameLocationByUbid(ubid);

    if (!residenceHistory) {
      this.logger.error(`Birdhouse not found`);
      throw new NotFoundException(`Birdhouse with ubid ${ubid} not found`);
    }

    const updateResidenceHistory = this.createResidenceHistoryObj(
      residenceHistory.birdHouseId,
      updateOccupancyDto.birds ? updateOccupancyDto.birds : residenceHistory.birds,
      updateOccupancyDto.eggs ? updateOccupancyDto.eggs : residenceHistory.eggs
    );

    try {
      const update = await this.residenceHistoryRepository.saveResidenceHistory(updateResidenceHistory);
      this.logger.verbose(`Updating residance history. New data: ${JSON.stringify(update)}`);
    } catch (error) {
      this.logger.error(error);
      throw new UpdateFailedException();
    }

    return this.birdhouseResponse(residenceHistory.birdhouse, updateResidenceHistory);

  }

  async findOne(ubid: string) {
    this.logger.log('Finding birdhouse and recent residence history');
    const residenceHistory = await this.residenceHistoryRepository.findRHIdBirdsEggsCreatedAtBirdhouseIdNameLocationByUbid(ubid);

    if (!residenceHistory) {
      this.logger.error(`Birdhouse not found`);
      throw new NotFoundException('House not found');
    }

    return this.birdhouseResponse(residenceHistory.birdhouse, residenceHistory);
  }

  birdhouseResponse(birdhouse: Birdhouse, residenceHistory: ResidenceHistory) {

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

    this.logger.verbose(`Returning response: ${JSON.stringify(response)}`);

    return response;
  }

  async residenceHistory(ubid: string) {

    const [birdhouse, residenceHistory] = await Promise.all([
      this.birdhouseRepository.findBirdhouseIdByUbid(ubid),
      this.residenceHistoryRepository.findRHBirdsEggsCreatedAtBirdhouseByUbid(ubid)
    ]);

    return {
      birdhouse,
      residenceHistory
    };

  }

}
