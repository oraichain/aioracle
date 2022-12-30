import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import config from 'src/config';

@Injectable()
export class AuthInternalMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.header('api-key');
    if (!apiKey || apiKey != config.INTERNAL_KEY) {
      throw new UnauthorizedException('Api key not found');
    }
    next();
  }
}
