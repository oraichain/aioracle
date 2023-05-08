import { ConsoleLogger } from '@nestjs/common';
import { logError, logInfo } from './log.provide';

export class LogService extends ConsoleLogger {
  error(message: any, ...optionalParams: [...any, string?, string?]) {
    logError(message, ...optionalParams);
    super.error(message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: [...any, string?]) {
    logInfo(message, ...optionalParams);
    super.debug(message, ...optionalParams);
  }
}
