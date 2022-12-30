import { Injectable } from '@nestjs/common';
import config from 'src/config';
import { AppQueue } from 'src/provides/queue/app.queue';
import { QUEUE_NAME } from 'src/provides/queue/constant.queue';

@Injectable()
export class QueueUIService {
  constructor(
  ) {}

  /**
   * 
   * @param name 'completed' | 'waiting' | 'active' | 'delayed' | 'failed' | 'paused';
   * @returns 
   */
  async jobs(name, params) {
    const queueAppp = new AppQueue(name);
    const queue = queueAppp.getQueue();
    const filterStatus = [];
    if (params?.status) {
      filterStatus.push(params.status);
    }
    return {
      name: name,
      count: await queue.count(),
      countTypes: await queue.getJobCounts(),
      list: await queue.getJobs(filterStatus)
    }
  }
}