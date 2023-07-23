import { HttpException, HttpStatus } from "@nestjs/common";

export class EmptyObjectException extends HttpException {

    constructor(message?: string, status?: HttpStatus) {
        super(message || 'Object is empty', status || HttpStatus.BAD_REQUEST);
    }

}