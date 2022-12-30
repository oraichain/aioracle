import {
  Controller,
  Body,
  Post,
  Get,
  Param,
  Res,
  HttpStatus
} from '@nestjs/common';
import { Response } from 'express';
import { CollectionSimilarDto } from '../dtos';
import { CollectionSimilarService } from '../services';

@Controller('report/collection')
export class CollectionSimilarController {
  constructor(private collectionSimilarService: CollectionSimilarService) {}

  @Post()
  async index(@Res() res: Response, @Body() body: CollectionSimilarDto) {
    return res.status(HttpStatus.OK).json(await this.collectionSimilarService.requestCollectionSimilar(body, res.locals.auth));
  }

  @Get('status/:id')
  async progessStatus(@Param('id') id: string) {
    return this.collectionSimilarService.progessStatus(id);
  }
}
