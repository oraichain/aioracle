import {
  Controller,
  Body,
  Post,
  Param,
  HttpStatus,
  Res
} from '@nestjs/common';
import { Response } from 'express';
import { CollectionSimilarService } from '../services';

@Controller('report/collection')
export class CollectionSimilarInternalController {
  constructor(private collectionSimilarService: CollectionSimilarService) {}

  @Post(':id/semantic/internal')
  async progessStatusReceiveInfo(@Res() res: Response, @Param('id') id: string, @Body() body) {
    await this.collectionSimilarService.receiveInfoReport(id, body);
    return res.status(HttpStatus.OK).json({
      "statusCode": HttpStatus.OK,
      "message": "Update report done"
    });
  }
}
