const async = require('async');
const path = require('path');
const winston = require('winston');

// FIXME: Should be passed into the app
// Load the configuration files.
const sourceConfig = require('../config/source');
const targetConfig = require('../config/target');
const mappingConfig = require('../config/mapping');

// Load the modules.
const source = require('./db_mysql');
const target = require('./db_postgres');
const tasks = require('./tasks');

module.exports = (() => {
  // Any cleanup work. Close connections, etc.
  function cleanup(callback) {
    winston.info('app.cleanup()');
    async.series([
      async.apply(source.cleanup),
      async.apply(target.runScriptFile, path.join(__dirname, '../sql/cleanTarget.sql')),
      async.apply(target.cleanup),
    ], callback);
  }

  // Actually move the data.
  function execute(callback) {
    winston.info('app.execute()');
    tasks.execute(callback);
  }

  // Initialize everything. Database connections etc.
  function init(callback) {
    winston.info('app.init()');

    async.series([
      async.apply(source.init, sourceConfig),
      async.apply(target.init, targetConfig),
      async.apply(target.runScriptFile, path.join(__dirname, '../sql/initTarget.sql')),
      async.apply(tasks.init, mappingConfig, source, target),
    ], callback);
  }

  function run() {
    winston.info('app.run()');

    const start = Date.now();

    async.series([
      init,
      execute,
      // report,
    ], (err) => {
      // Cleanup, regardless or error or success.
      // Note this is async.
      cleanup();

      if (err) {
        return winston.error('Application Error', err);
      }
      const elapsedSec = (Date.now() - start) / 1000;

      return winston.info('Application', { elapsedSec });
    });
  }

  // Reveal the public functions
  return {
    run,
  };
})();
