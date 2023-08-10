import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResidenceHistory } from '../entities/residence-history.entity';

@Injectable()
export class ResidenceHistoryRepository extends Repository<ResidenceHistory>{

  constructor(@InjectRepository(ResidenceHistory) repository: Repository<ResidenceHistory>) {
    super(repository.target, repository.manager);
  }

  findRHIdCreatedAtByBirdhouseId(birdHouseId: string): Promise<ResidenceHistory[]> {
    return this.find({
      where: { birdHouseId },
      select: { id: true, createdAt: true, birdHouseId: true },
      order: { createdAt: 'DESC' }
    });
  }

  saveResidenceHistory(residenceHistory: ResidenceHistory): Promise<ResidenceHistory> {
    return this.save(residenceHistory);
  }

  removeResidenceHistory(residenceHistory: ResidenceHistory): Promise<ResidenceHistory> {
    return this.remove(residenceHistory)
  }

  findRHBirdsEggsCreatedAtByBirdhouseId(birdHouseId: string): Promise<ResidenceHistory> {
    return this.findOne({
      where: { birdHouseId },
      select: { birds: true, eggs: true, createdAt: true },
      order: { createdAt: 'DESC' },
    });
  }

  findRHIdBirdsEggsCreatedAtBirdhouseIdNameLocationByUbid(ubid: string): Promise<ResidenceHistory> {
    return this.findOne({
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
    return this.find({
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
