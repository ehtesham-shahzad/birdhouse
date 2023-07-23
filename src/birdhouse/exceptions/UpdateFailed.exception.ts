import { HttpException, HttpStatus } from "@nestjs/common";

export class UpdateFailedException extends HttpException {

    constructor(message?: string, status?: HttpStatus) {
        super(message || 'Failed to update a house', status || HttpStatus.INTERNAL_SERVER_ERROR);
    }

}