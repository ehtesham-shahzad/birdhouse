import { Injectable, NotFoundException } from '@nestjs/common';
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

  constructor(
    @InjectRepository(Birdhouse) private readonly birdhouseRepository: Repository<Birdhouse>,
    @InjectRepository(ResidenceHistory) private readonly residenceHistoryRepository: Repository<ResidenceHistory>,
  ) { }

  onModuleInit() {
    if (soldBirdhouses.length === 0) {
      this.birdhouseRepository.find()
        .then(res => {
          for (let i = 0; i < res.length; i++) {
            soldBirdhouses.push(res[i].ubid);
          }
        })
        .catch(e => {
          console.log(e);
          console.log('Unable to communicate with database! Establish the connection.')
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

    const residenceHistory = new ResidenceHistory();
    residenceHistory.id = uuidv4();
    residenceHistory.birdHouseId = birdhouse.id;

    let saveBirdhouse: Birdhouse;
    let savedResidenceHistory: ResidenceHistory;
    try {
      saveBirdhouse = await this.birdhouseRepository.save(birdhouse);
      savedResidenceHistory = await this.residenceHistoryRepository.save(residenceHistory);
    } catch (error) {
      console.log(error);
      throw new RegistractionFailedException();
    }

    soldBirdhouses.push(saveBirdhouse.ubid);
    return this.birdhouseResponse(saveBirdhouse, savedResidenceHistory);

  }

  async update(ubid: string, updateBirdhouseDto: UpdateBirdhouseDto) {

    if (Object.keys(updateBirdhouseDto).length === 0) {
      console.log('Object is empty');
      throw new EmptyObjectException();
    }

    const birdhouse = await this.birdhouseRepository.findOne({ where: { ubid }, select: { id: true } });

    if (!birdhouse) {
      console.log('Birdhouse not found');
      throw new NotFoundException(`Birdhouse with ubid ${ubid} not found`);
    }

    updateBirdhouseDto.updatedAt = new Date();

    try {
      await this.birdhouseRepository.update(birdhouse.id, updateBirdhouseDto);
    } catch (error) {
      console.log(error);
      throw new UpdateFailedException()
    }

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
      console.log('Object is empty');
      throw new EmptyObjectException();
    }

    const residenceHistory = await this.residenceHistoryRepository.findOne({
      where: { birdhouse: { ubid } },
      select: {
        id: true,
        eggs: true,
        birds: true,
        birdHouseId: true,
        birdhouse: { id: true, ubid: true },
        createdAt: true
      },
      relations: { birdhouse: true },
      order: { createdAt: 'DESC' },
    });

    if (!residenceHistory) {
      console.log('Birdhouse not found');
      throw new NotFoundException(`Birdhouse with ubid ${ubid} not found`);
    }

    const updateResidenceHistory = new ResidenceHistory();
    updateResidenceHistory.id = uuidv4();
    updateResidenceHistory.birdHouseId = residenceHistory.birdHouseId;
    updateResidenceHistory.birds = updateOccupancyDto.birds ? updateOccupancyDto.birds : residenceHistory.birds;
    updateResidenceHistory.eggs = updateOccupancyDto.eggs ? updateOccupancyDto.eggs : residenceHistory.eggs;

    try {
      await this.residenceHistoryRepository.save(updateResidenceHistory);
    } catch (error) {
      console.log(error);
      throw new UpdateFailedException()
    }

    const birdHouse = await this.birdhouseRepository.findOne({
      where: { ubid },
      select: { longitude: true, latitude: true, name: true }
    });

    return this.birdhouseResponse(birdHouse, updateResidenceHistory);

  }

  async findOne(ubid: string) {

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
    })

    if (!residenceHistory) {
      throw new NotFoundException('House not found');
    }

    return this.birdhouseResponse(residenceHistory.birdhouse, residenceHistory);
  }

  async birdhouseResponse(birdhouse: Birdhouse, residenceHistory: ResidenceHistory) {

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

    return response;
  }

}
