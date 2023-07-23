import { Module } from '@nestjs/common';
import { BirdhouseService } from './birdhouse.service';
import { BirdhouseController } from './birdhouse.controller';

@Module({
  controllers: [BirdhouseController],
  providers: [BirdhouseService]
})
export class BirdhouseModule {}
