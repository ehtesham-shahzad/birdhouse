import { Body, Controller, Get, Logger, Param, Patch, Post } from '@nestjs/common';
import { BirdhouseService } from './birdhouse.service';
import { CreateBirdhouseRequestDto } from './dto/create-birdhouse-request.dto';
import { UpdateBirdhouseDto } from './dto/update-birdhouse.dto';
import { UpdateOccupancyDto } from './dto/update-occupancy.dto';

@Controller('house')
export class BirdhouseController {

  private logger = new Logger(BirdhouseController.name);

  constructor(private readonly birdhouseService: BirdhouseService) { }

  @Post()
  create(@Body() createBirdhouseDto: CreateBirdhouseRequestDto) {
    this.logger.verbose(`Creating new birdhouse with data ${JSON.stringify(createBirdhouseDto)}`);
    return this.birdhouseService.create(createBirdhouseDto);
  }

  @Post('bulk')
  createInBulk(@Body() createBirdhousesDto: CreateBirdhouseRequestDto[]) {
    this.logger.verbose(`Creating new birdhouse with data ${JSON.stringify(createBirdhousesDto)}`);
    return this.birdhouseService.createInBulk(createBirdhousesDto);
  }

  @Get(':ubid')
  async findOne(@Param('ubid') ubid: string) {
    this.logger.verbose(`Finding a birdhouse against ubid: ${ubid}`);
    return await this.birdhouseService.findOne(ubid);
  }

  @Patch(':ubid')
  update(@Param('ubid') ubid: string, @Body() updateBirdhouseDto: UpdateBirdhouseDto) {
    return this.birdhouseService.update(ubid, updateBirdhouseDto);
  }

  @Post(':ubid/occupancy')
  updateOccupancy(@Param('ubid') ubid: string, @Body() updateOccupancyDto: UpdateOccupancyDto) {
    this.logger.verbose(`Updating birdhouse occupancy with ubid: ${ubid}. Update DTO: ${JSON.stringify(updateOccupancyDto)}`);
    return this.birdhouseService.updateOccupancy(ubid, updateOccupancyDto);
  }

  @Get(':ubid/residence-history')
  residenceHistory(@Param('ubid') ubid: string) {
    this.logger.verbose(`Getting history of birdhouse residence for UBID ${ubid}`);
    return this.birdhouseService.residenceHistory(ubid);
  }

}
