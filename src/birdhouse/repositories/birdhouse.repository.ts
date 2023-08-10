import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { UpdateBirdhouseDto } from '../dto/update-birdhouse.dto';
import { Birdhouse } from '../entities/birdhouse.entity';

@Injectable()
export class BirdhouseRepository extends Repository<Birdhouse> {

  constructor(@InjectRepository(Birdhouse) repository: Repository<Birdhouse>) {
    super(repository.target, repository.manager);
  }

  getBirdhouseUbids(): Promise<Birdhouse[]> {
    return this.find({ select: { ubid: true } });
  }

  getBirdhouseIdsUpdatedAt(): Promise<Birdhouse[]> {
    return this.find({ select: { id: true, updatedAt: true } });
  }

  deleteBirdhouseById(id: string): Promise<DeleteResult> {
    return this.delete({ id });
  }

  saveBirdhouse(birdhouse: Birdhouse): Promise<Birdhouse> {
    return this.save(birdhouse);
  }

  findBirdhouseIdByUbid(ubid: string): Promise<Birdhouse> {
    return this.findOne({ where: { ubid }, select: { id: true } })
  }

  updateBirdhouse(id: string, updateBirdhouseDto: UpdateBirdhouseDto) {
    return this.update(id, updateBirdhouseDto);
  }

  findBirdhouseNameLocationById(id: string): Promise<Birdhouse> {
    return this.findOne({
      where: { id },
      select: { name: true, longitude: true, latitude: true }
    });
  }

  findBirdhouseNameLocationByUbid(ubid: string): Promise<Birdhouse> {
    return this.findOne({
      where: { ubid },
      select: { name: true, latitude: true, longitude: true }
    });
  }

}
