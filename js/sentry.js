const Sentry = require("@sentry/node");
const { BrowserTracing } = require('@sentry/tracing');
const { env } = require('./config');

let isRunSentry = false;
if (!env.APP_ENV || env.APP_ENV.toLowerCase() === 'production') {
  isRunSentry = true;
}

class SentryTrace {
  static tx;

  static init() {
    if (!isRunSentry) {
      return false;
    }
    let keyProj = `executor-${env.NETWORK_TYPE}`;
    if (env.APP_ENV) {
      keyProj += '-' + env.APP_ENV;
    }
    keyProj += '@0.0.1';
    Sentry.init({
      dsn: env.SENTRY_DNS,
      // Alternatively, use `process.env.npm_package_version` for a dynamic release version
      // if your build tool supports it.
      release: keyProj,
      integrations: [new BrowserTracing()],

      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,
      environment: env.APP_ENV,
    });
  }

  /**
   * start transaction -> 1 action hoat dong (~ 1 user)
   *  dung finish(); de ket thuc transaction
   *
   * @param {any} options 
   * @returns 
   */
  static transaction(options={}, isNew=false) {
    if (!isRunSentry) {
      return false;
    }
    if (isNew || !SentryTrace.tx) {
      SentryTrace.tx = SentryTrace.newTransaction(options);
    }
    return SentryTrace.tx;
  }

  static newTransaction(options={}) {
    if (!isRunSentry) {
      return false;
    }
    options = Object.assign({
      op: "op_executor",
      name: "Executor transaction",
    }, options);
    return Sentry.startTransaction(options);
  }

  static finish(st=null) {
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
  static capture(e, textMore='') {
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

module.exports = {
  SentryTrace
};
