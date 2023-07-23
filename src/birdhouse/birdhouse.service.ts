import { Injectable } from '@nestjs/common';
import { CreateBirdhouseRequestDto } from './dto/create-birdhouse-request.dto';
import { UpdateBirdhouseDto } from './dto/update-birdhouse.dto';

@Injectable()
export class BirdhouseService {

  // constructor()

  create(createBirdhouseDto: CreateBirdhouseRequestDto) {
    return 'This action adds a new birdhouse';
  }

  findAll() {
    return `This action returns all birdhouse`;
  }

  findOne(id: string) {
    return `This action returns a #${id} birdhouse`;
  }

  update(id: string, updateBirdhouseDto: UpdateBirdhouseDto) {
    return `This action updates a #${id} birdhouse`;
  }

  remove(id: string) {
    return `This action removes a #${id} birdhouse`;
  }
}
