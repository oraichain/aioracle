import { Module } from '@nestjs/common';
import { SeedCommand } from './commands';

@Module({
  imports: [],
  controllers: [],
  providers: [SeedCommand],
})
export class AppCommanderModule {}
