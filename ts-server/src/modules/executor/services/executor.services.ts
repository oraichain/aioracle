import {
  Injectable,
} from '@nestjs/common';

@Injectable()
export class ExecutorService {
  constructor() {}

  async getAIReport(): Promise<any> {
    return 1;
  }
}
