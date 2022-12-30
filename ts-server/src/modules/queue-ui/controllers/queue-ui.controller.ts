import { Controller, Get, Param, Query} from '@nestjs/common';
import { QueueUIService } from '../services/queue-ui.service';
import { QUEUE_NAME } from 'src/provides/queue/constant.queue';

@Controller('queueui')
export class QueueUIController {
  constructor(private queueUIService: QueueUIService) {}

  @Get()
  index() {
    return {name: QUEUE_NAME,
      status: "'completed' | 'waiting' | 'active' | 'delayed' | 'failed' | 'paused'"
    };
  }

  @Get('job/:name')
  jobs(@Param('name') name: string, @Query() query) {
    return this.queueUIService.jobs(name, query);
  }
}
