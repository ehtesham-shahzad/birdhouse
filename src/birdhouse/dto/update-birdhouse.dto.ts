import { PartialType } from '@nestjs/mapped-types';
import { IsEmpty } from 'class-validator';
import { CreateBirdhouseRequestDto } from './create-birdhouse-request.dto';

export class UpdateBirdhouseDto extends PartialType(CreateBirdhouseRequestDto) {
    @IsEmpty()
    updatedAt: Date;
}
