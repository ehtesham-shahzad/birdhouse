import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { UpdateBirdhouseDto } from './dto/update-birdhouse.dto';
import { Birdhouse } from './entities/birdhouse.entity';
import { ResidenceHistory } from './entities/residence-history.entity';

@Injectable()
export class BirdhouseRepository {

  constructor(
    @InjectRepository(Birdhouse) private readonly birdhouseRepository: Repository<Birdhouse>,
    @InjectRepository(ResidenceHistory) private readonly residenceHistoryRepository: Repository<ResidenceHistory>,
  ) { }

  getBirdhouseUbids(): Promise<Birdhouse[]> {
    return this.birdhouseRepository.find({ select: { ubid: true } });
  }

  getBirdhouseIdsUpdatedAt(): Promise<Birdhouse[]> {
    return this.birdhouseRepository.find({ select: { id: true, updatedAt: true } });
  }

  deleteBirdhouseById(id: string): Promise<DeleteResult> {
    return this.birdhouseRepository.delete({ id });
  }

  saveBirdhouse(birdhouse: Birdhouse): Promise<Birdhouse> {
    return this.birdhouseRepository.save(birdhouse);
  }

  findBirdhouseIdByUbid(ubid: string): Promise<Birdhouse> {
    return this.birdhouseRepository.findOne({ where: { ubid }, select: { id: true } })
  }

  updateBirdhouse(id: string, updateBirdhouseDto: UpdateBirdhouseDto) {
    return this.birdhouseRepository.update(id, updateBirdhouseDto);
  }

  findBirdhouseNameLocationById(id: string): Promise<Birdhouse> {
    return this.birdhouseRepository.findOne({
      where: { id },
      select: { name: true, longitude: true, latitude: true }
    });
  }

  findBirdhouseNameLocationByUbid(ubid: string): Promise<Birdhouse> {
    return this.birdhouseRepository.findOne({
      where: { ubid },
      select: { name: true, latitude: true, longitude: true }
    });
  }

  findRHIdCreatedAtByBirdhouseId(birdHouseId: string): Promise<ResidenceHistory[]> {
    return this.residenceHistoryRepository.find({
      where: { birdHouseId },
      select: { id: true, createdAt: true, birdHouseId: true },
      order: { createdAt: 'DESC' }
    });
  }

  saveResidenceHistory(residenceHistory: ResidenceHistory): Promise<ResidenceHistory> {
    return this.residenceHistoryRepository.save(residenceHistory);
  }

  removeResidenceHistory(residenceHistory: ResidenceHistory): Promise<ResidenceHistory> {
    return this.residenceHistoryRepository.remove(residenceHistory)
  }

  findRHBirdsEggsCreatedAtByBirdhouseId(birdHouseId: string): Promise<ResidenceHistory> {
    return this.residenceHistoryRepository.findOne({
      where: { birdHouseId },
      select: { birds: true, eggs: true, createdAt: true },
      order: { createdAt: 'DESC' },
    });
  }

  findRHIdBirdsEggsCreatedAtBirdhouseIdNameLocationByUbid(ubid: string): Promise<ResidenceHistory> {
    return this.residenceHistoryRepository.findOne({
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
  }

  findRHBirdsEggsCreatedAtBirdhouseByUbid(ubid: string): Promise<ResidenceHistory[]> {
    return this.residenceHistoryRepository.find({
      where: { birdhouse: { ubid } },
      select: {
        eggs: true,
        birds: true,
        birdhouse: { id: false },
        createdAt: true
      },
      relations: { birdhouse: true },
      order: { createdAt: 'DESC' }
    });
  }

}
