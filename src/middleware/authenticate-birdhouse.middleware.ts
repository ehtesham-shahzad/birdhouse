import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { soldBirdhouses } from 'src/birdhouse/birdhouse.service';
import { InvalidUBIDException } from 'src/birdhouse/exceptions/InvalidUBID.exception';

@Injectable()
export class AuthenticateBirdhouseMiddleware implements NestMiddleware {

    use(req: Request, _: Response, next: NextFunction) {
        const ubidHeader = req.headers['x-ubid'] as string;
        if (!ubidHeader) {
            throw new InvalidUBIDException('Forbidden: Invalid X-UBID header', HttpStatus.FORBIDDEN)
        }

        if (!soldBirdhouses.includes(ubidHeader)) {
            throw new InvalidUBIDException('Forbidden: Invalid X-UBID header', HttpStatus.FORBIDDEN)
        }
        next();
    }
}
