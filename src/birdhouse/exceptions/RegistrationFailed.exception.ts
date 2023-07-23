import { HttpException, HttpStatus } from "@nestjs/common";

export class RegistractionFailedException extends HttpException {

    constructor(message?: string, status?: HttpStatus) {
        super(message || 'Failed to register a house', status || HttpStatus.INTERNAL_SERVER_ERROR);
    }

}