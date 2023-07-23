import { CreateBirdhouseRequestDto } from "./create-birdhouse-request.dto";

export class CreateBirdhouseResponseDto extends CreateBirdhouseRequestDto {
    id: string;
    ubid: string;
    birds: number;
    eggs: number;
}
