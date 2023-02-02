import * as Sentry from '@sentry/node';
import type { Hub } from '@sentry/node';
import '@sentry/tracing';
import config from "src/config";

let isRunSentry = false;
if (!config.APP_ENV || config.APP_ENV.toLowerCase() === 'production') {
  isRunSentry = true;
}

export class SentryTrace {
  static tx: ReturnType<Hub['startTransaction']>;

  static isRunSentry() {
    return isRunSentry;
  }

  static init() {
    if (!isRunSentry) {
      return false;
    }
    let keyProj = `executor-${config.NETWORK_TYPE}`;
    if (config.APP_ENV) {
      keyProj += '-' + config.APP_ENV;
    }
    keyProj += '@0.0.1';
    Sentry.init({
      dsn: config.SENTRY_DNS,
      // Alternatively, use `process.env.npm_package_version` for a dynamic release version
      // if your build tool supports it.
      release: keyProj,

      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,
      environment: config.APP_ENV,
    });
  }

  /**
   * start transaction -> 1 action hoat dong (~ 1 user)
   *  dung finish(); de ket thuc transaction
   *
   * @param {any} options 
   * @returns 
   */
  static transaction(options: any={}, isNew=false) {
    if (!isRunSentry) {
      return false;
    }
    if (isNew || !SentryTrace.tx) {
      SentryTrace.tx = SentryTrace.newTransaction(options);
    }
    return SentryTrace.tx;
  }

  static newTransaction(options: any={}) {
    options = Object.assign({
      op: "op_executor",
      name: "Executor transaction",
    }, options);
    return Sentry.startTransaction(options);
  }

  static finish(st: ReturnType<Hub['startTransaction']>=null) {
    if (!isRunSentry) {
      return false;
    }
    if (st) {
      st.finish();
    } else {
      SentryTrace.tx.finish();
    }
  }

  /**
   * not use, dung truc tiep trong exception luon
   * @param {*} e 
   */
  static capture(e: Error, textMore='') {
    if (textMore) {
      console.error(textMore, e);
    } else {
      console.error(e);
    }
    if (!isRunSentry) {
      return false;
    }
    Sentry.captureException(e);
  };
}
