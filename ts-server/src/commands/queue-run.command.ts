import { Command, CommandRunner, Option } from 'nest-commander';
import { AppQueue } from 'src/provides/queue/app.queue';

interface QueueRunCommandOptions {
  name?: string;
}

@Command({ name: 'queue', description: 'Queue run' })
export class QueueRunCommand implements CommandRunner {
  constructor() {}

  async run(
    passedParam: string[],
    options?: QueueRunCommandOptions,
  ): Promise<void> {
    const arrQueue = ['CollectionSimilar'];

    // run all queue
    if (options.name === 'all') {
      arrQueue.forEach(item => {
        const queueJob = new AppQueue(item);
        queueJob.process();
      });
      return;
    }

    if (!options.name || !arrQueue.includes(options.name)) {
      console.log('miss queue name: ', arrQueue)
      return;
    }
    // single queue
    const queueJob = new AppQueue(options.name);
    queueJob.process();
  }

  @Option({
    flags: '--name [string]',
    description: 'name of queue',
  })
  parseName(val: string): string {
    return val;
  }
}
