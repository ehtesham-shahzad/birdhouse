import { PartialType } from '@nestjs/mapped-types';
import { CreateBirdhouseRequestDto } from './create-birdhouse-request.dto';

export class UpdateBirdhouseDto extends PartialType(CreateBirdhouseRequestDto) { }
