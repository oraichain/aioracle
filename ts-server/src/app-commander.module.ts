import { Module } from '@nestjs/common';
import { IntervalCommand } from './commands';

@Module({
  imports: [],
  controllers: [],
  providers: [IntervalCommand],
})
export class AppCommanderModule {}
