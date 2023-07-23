import { IsLatitude, IsLongitude, IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from "class-validator";

export class CreateBirdhouseRequestDto {

    @IsNumber()
    @IsLongitude()
    longitude: number;

    @IsNumber()
    @IsLatitude()
    latitude: number;

    @IsString()
    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(16)
    name: string;
}
