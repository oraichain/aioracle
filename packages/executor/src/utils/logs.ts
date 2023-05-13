import * as fs from 'fs';
import * as util from 'util';
import * as moment from "moment";
import config from '../config';
import { SentryTrace } from 'src/helpers/sentry';

const logStdout = process.stdout;
const folderLogs = `${config.basedir}logs/`;

if (config.LOG_FILE !== '0' && !fs.existsSync(folderLogs)) {
  fs.mkdirSync(folderLogs);
}

function logConsole(d) {
  logStdout.write(util.format(d) + '\n');
}

function logFile(d, file) {
  if (config.LOG_FILE === '0') {
    return true;
  }
  var logText = '';
  for (const i in d) {
    logText += util.format(d[i]) + ' -- ';
  }
  fs.appendFileSync(file, moment().format('YYYY-MM-DD HH:mm:ss') + ': ' + logText.slice(0, -4) + '\n');
}

function openFile(fileName) {
  if (config.LOG_FILE === '0') {
    return true;
  }
  return `${config.basedir}logs/${moment().format('YYYYMMDD')}_${fileName}.log`;
}

export function logInfo(...d) {
  logFile(d, openFile('info'));
}

export function logError(errorObj, ...d) {
  SentryTrace.capture(errorObj, d);
  SentryTrace.finish();
  logFile(d.concat(errorObj), openFile('error'));
}

export function logInfoConsole(...d) {
  logFile(d, openFile('info'));
  logConsole(d);
}

export function logErrorConsole(...d) {
  logFile(d, openFile('error'));
  logConsole(d);
}

export function logFileName(fileName, ...d) {
  logFile(d, openFile(fileName));
}
