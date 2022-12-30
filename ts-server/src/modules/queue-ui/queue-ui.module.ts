import { Module } from '@nestjs/common';
import { QueueUIController } from './controllers/queue-ui.controller';
import { HomeController } from './controllers/home.controller';
import { QueueUIService } from './services/queue-ui.service';

@Module({
  controllers: [QueueUIController, HomeController],
  providers: [QueueUIService],
})
export class QueueUIModule {}