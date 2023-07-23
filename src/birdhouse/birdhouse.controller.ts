import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { BirdhouseService } from './birdhouse.service';
import { CreateBirdhouseRequestDto } from './dto/create-birdhouse-request.dto';
import { UpdateBirdhouseDto } from './dto/update-birdhouse.dto';
import { UpdateOccupancyDto } from './dto/update-occupancy.dto';

@Controller('house')
export class BirdhouseController {
  constructor(private readonly birdhouseService: BirdhouseService) { }

  @Post()
  create(@Body() createBirdhouseDto: CreateBirdhouseRequestDto) {
    return this.birdhouseService.create(createBirdhouseDto);
  }

  @Get(':ubid')
  async findOne(@Param('ubid') ubid: string) {
    return await this.birdhouseService.findOne(ubid);
  }

  @Patch(':ubid')
  update(@Param('ubid') ubid: string, @Body() updateBirdhouseDto: UpdateBirdhouseDto) {
    return this.birdhouseService.update(ubid, updateBirdhouseDto);
  }

  @Post(':ubid/occupancy')
  updateOccupancy(@Param('ubid') ubid: string, @Body() updateOccupancyDto: UpdateOccupancyDto) {
    return this.birdhouseService.updateOccupancy(ubid, updateOccupancyDto);
  }

}
