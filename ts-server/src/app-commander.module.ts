import { Module } from '@nestjs/common';
import { ReportCrawCommand, SeedCommand, QueueRunCommand } from './commands';
import { dbProviders } from './provides/db.provide';

@Module({
  imports: [],
  controllers: [],
  providers: [...dbProviders, ReportCrawCommand, SeedCommand, QueueRunCommand],
})
export class AppCommanderModule {}
