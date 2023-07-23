import { IsEmpty, IsNumber, IsOptional } from "class-validator";

export class UpdateOccupancyDto {

    @IsNumber()
    @IsOptional()
    birds?: number;

    @IsNumber()
    @IsOptional()
    eggs?: number

    @IsEmpty()
    updatedAt: Date;
}
