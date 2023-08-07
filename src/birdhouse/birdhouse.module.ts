import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BirdhouseController } from './birdhouse.controller';
import { BirdhouseRepository } from './birdhouse.repository';
import { BirdhouseService } from './birdhouse.service';
import { Birdhouse } from './entities/birdhouse.entity';
import { ResidenceHistory } from './entities/residence-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Birdhouse, ResidenceHistory])],
  controllers: [BirdhouseController],
  providers: [BirdhouseService, BirdhouseRepository]
})
export class BirdhouseModule { }
