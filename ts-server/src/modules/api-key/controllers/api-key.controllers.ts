import {
  Controller,
  Headers,
  Get,
  UploadedFiles,
  UseInterceptors,
  Post,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiKeyService } from '../services';

@Controller('api-key')
export class ApiKeyController {
  constructor(private apiKeyService: ApiKeyService) {}

  @Post('report')
  @UseInterceptors(AnyFilesInterceptor())
  async create(
    @Headers() header,
    @UploadedFiles() file: Express.Multer.File,
  ): Promise<any> {
    return await this.apiKeyService.getReport(file[0], header['api-key']);
  }
}
