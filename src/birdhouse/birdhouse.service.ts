import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CreateBirdhouseRequestDto } from './dto/create-birdhouse-request.dto';
import { CreateBirdhouseResponseDto } from './dto/create-birdhouse-response.dto';
import { UpdateBirdhouseDto } from './dto/update-birdhouse.dto';
import { UpdateOccupancyDto } from './dto/update-occupancy.dto';
import { Birdhouse } from './entities/birdhouse.entity';
import { EmptyObjectException } from './exceptions/EmptyObject.exception';
import { InvalidUBIDException } from './exceptions/InvalidUBID.exception';
import { RegistractionFailedException } from './exceptions/RegistrationFailed.exception';
import { UpdateFailedException } from './exceptions/UpdateFailed.exception';

@Injectable()
export class BirdhouseService {

  constructor(@InjectRepository(Birdhouse) private readonly birdhouseService: Repository<Birdhouse>) { }

  async create(createBirdhouseDto: CreateBirdhouseRequestDto) {

    const birdhouse = new Birdhouse();
    birdhouse.id = uuidv4();
    birdhouse.ubid = uuidv4();
    birdhouse.name = createBirdhouseDto.name;
    birdhouse.longitude = createBirdhouseDto.longitude;
    birdhouse.latitude = createBirdhouseDto.latitude;

    let saveBirdhouse: Birdhouse;
    try {
      saveBirdhouse = await this.birdhouseService.save(birdhouse);
    } catch (error) {
      console.log(error);
      throw new RegistractionFailedException();
    }

    const response = new CreateBirdhouseResponseDto();
    response.id = saveBirdhouse.id;
    response.ubid = saveBirdhouse.ubid;
    response.longitude = saveBirdhouse.longitude;
    response.latitude = saveBirdhouse.latitude;
    response.name = saveBirdhouse.name;
    response.birds = saveBirdhouse.birds;
    response.eggs = saveBirdhouse.eggs;

    return response;
  }

  async update(ubid: string, updateBirdhouseDto: UpdateBirdhouseDto) {

    if (!isUUID(ubid)) {
      console.log('Invalid UBID');
      throw new InvalidUBIDException();
    }

    if (Object.keys(updateBirdhouseDto).length === 0) {
      console.log('Object is empty');
      throw new EmptyObjectException();
    }

    const birdhouse = await this.birdhouseService.findOne({ where: { ubid }, select: { id: true } });

    if (!birdhouse) {
      console.log('Birdhouse not found');
      throw new NotFoundException(`Birdhouse with ubid ${ubid} not found`);
    }

    updateBirdhouseDto.updatedAt = new Date();

    try {
      await this.birdhouseService.update(birdhouse.id, updateBirdhouseDto);
    } catch (error) {
      console.log(error);
      throw new UpdateFailedException()
    }

    return await this.birdhouseService.findOne({
      where: { id: birdhouse.id },
      select: { birds: true, eggs: true, longitude: true, latitude: true, name: true }
    });
  }

  async updateOccupancy(ubid: string, updateOccupancyDto: UpdateOccupancyDto) {

    if (!isUUID(ubid)) {
      console.log('Invalid UBID');
      throw new InvalidUBIDException();
    }

    if (Object.keys(updateOccupancyDto).length === 0) {
      console.log('Object is empty');
      throw new EmptyObjectException();
    }

    const birdhouse = await this.birdhouseService.findOne({ where: { ubid }, select: { id: true } });

    if (!birdhouse) {
      console.log('Birdhouse not found');
      throw new NotFoundException(`Birdhouse with ubid ${ubid} not found`);
    }

    updateOccupancyDto.updatedAt = new Date();

    try {
      await this.birdhouseService.update(birdhouse.id, updateOccupancyDto);
    } catch (error) {
      console.log(error);
      throw new UpdateFailedException()
    }

    return await this.birdhouseService.find({
      where: { id: birdhouse.id },
      select: { birds: true, eggs: true, longitude: true, latitude: true, name: true }
    });
  }

  async findOne(ubid: string) {

    if (!isUUID(ubid)) {
      console.log('Invalid UBID');
      throw new InvalidUBIDException();
    }
    const house = await this.birdhouseService.findOne({
      where: { ubid },
      select: { birds: true, eggs: true, longitude: true, latitude: true, name: true }
    });
    if (!house) {
      throw new NotFoundException('House not found');
    }
    return house;
  }

}
