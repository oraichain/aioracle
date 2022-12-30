import { Command, CommandRunner, Option } from 'nest-commander';
import AppSeedFactory from 'src/database/seeds/app.fatory';

interface SeedCommandOptions {
  class?: string;
}

@Command({ name: 'seed', description: 'Seeder' })
export class SeedCommand implements CommandRunner {
  constructor() {}

  async run(
    passedParam: string[],
    options?: SeedCommandOptions,
  ): Promise<void> {
    let seedClass = options.class;
    if (!seedClass) {
      console.log('Seed class null!');
      return;
    }
    const appSeeder = new AppSeedFactory();
    appSeeder.run(seedClass);
  }

  @Option({
    flags: '--class [string]',
    description: 'class name (not word "seed")',
  })
  parseFrom(val: string): string {
    return val;
  }
}
