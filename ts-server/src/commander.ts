import { CommandFactory } from 'nest-commander';
import { AppCommanderModule } from './app-commander.module';

async function bootstrap() {
  await CommandFactory.run(AppCommanderModule);
}
bootstrap();
