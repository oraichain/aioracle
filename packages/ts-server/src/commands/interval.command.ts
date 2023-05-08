import { Command, CommandRunner, Option } from 'nest-commander';
import { IntervalService } from 'src/modules/interval/services';

@Command({ name: 'interval', description: 'Interval process' })
export class IntervalCommand implements CommandRunner {
  constructor() {}

  async run(
    passedParam: string[],
    options?: any,
  ): Promise<void> {
    const intervalService = new IntervalService();
    await intervalService.runMain();
  }
}
