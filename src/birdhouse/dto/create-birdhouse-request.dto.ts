import { IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from "class-validator";

export class CreateBirdhouseRequestDto {

    @IsNumber()
    longitude: number;

    @IsNumber()
    latitude: number;

    @IsString()
    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(16)
    name: string;
}
