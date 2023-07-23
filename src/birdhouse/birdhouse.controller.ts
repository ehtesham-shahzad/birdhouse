import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { BirdhouseService } from './birdhouse.service';
import { CreateBirdhouseRequestDto } from './dto/create-birdhouse-request.dto';
import { UpdateBirdhouseDto } from './dto/update-birdhouse.dto';

@Controller('birdhouse')
export class BirdhouseController {
  constructor(private readonly birdhouseService: BirdhouseService) { }

  @Post('/house')
  create(@Body() createBirdhouseDto: CreateBirdhouseRequestDto) {
    return this.birdhouseService.create(createBirdhouseDto);
  }

  @Get()
  findAll() {
    return this.birdhouseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.birdhouseService.findOne(id);
  }

  @Patch('/house/:ubid')
  update(@Param('ubid') ubid: string, @Body() updateBirdhouseDto: UpdateBirdhouseDto) {
    return this.birdhouseService.update(ubid, updateBirdhouseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.birdhouseService.remove(id);
  }
}
