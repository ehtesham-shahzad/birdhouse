import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BirdhouseController } from './birdhouse.controller';
import { BirdhouseService } from './birdhouse.service';
import { Birdhouse } from './entities/birdhouse.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Birdhouse])],
  controllers: [BirdhouseController],
  providers: [BirdhouseService]
})
export class BirdhouseModule { }
