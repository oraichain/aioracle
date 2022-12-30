import { Command, CommandRunner, Option } from 'nest-commander';

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
    console.log(111);
  }

  @Option({
    flags: '--class [string]',
    description: 'class name (not word "seed")',
  })
  parseFrom(val: string): string {
    return val;
  }
}
