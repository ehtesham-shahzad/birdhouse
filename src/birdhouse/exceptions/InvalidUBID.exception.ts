import { HttpException, HttpStatus } from "@nestjs/common";

export class InvalidUBIDException extends HttpException {
    constructor(message?: string, status?: HttpStatus) {
        super(message || 'Invalid UBID', status || HttpStatus.BAD_REQUEST)
    }
}