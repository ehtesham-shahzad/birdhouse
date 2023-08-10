import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BirdhouseController } from './birdhouse.controller';
import { BirdhouseService } from './birdhouse.service';
import { Birdhouse } from './entities/birdhouse.entity';
import { ResidenceHistory } from './entities/residence-history.entity';
import { BirdhouseRepository } from './repositories/birdhouse.repository';
import { ResidenceHistoryRepository } from './repositories/residenceHistory.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Birdhouse, ResidenceHistory])],
  controllers: [BirdhouseController],
  providers: [BirdhouseService, BirdhouseRepository, ResidenceHistoryRepository]
})
export class BirdhouseModule { }