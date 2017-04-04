// Import npm modules
const async = require('async');
const winston = require('winston');

// Import local modules
const configureLogger = require('./configureLogger');
const exporter = require('./exporter/exporter');
const importer = require('./importer/importer');

module.exports = (() => {
  /**
   * Initializes the common components of the application.
   * This must be called before exporting or importing as
   * the logger needs to be configured.
   */
  const init = (logLevel) => {
    configureLogger({
      level: logLevel,
      logPath: 'logs/log.txt',
    });
  };

  /**
   * Performs the export out of the EMR.
   */
  const doExport = (exportOptions, callback) => {
    if (exportOptions === {}) {
      return callback(null, 'Skipping Export');
    }

    return async.series([
      async.apply(exporter.init, exportOptions),
      async.apply(exporter.run),
    ], (err, res) => {
      exporter.cleanup(() =>
        // Note that the cleanup errors and results are ignored.
         callback(err, res));
    });
  };

  /**
   * Performs the import into the Universal Schema.
   */
  const doImport = (importOptions, callback) => {
    if (importOptions === {}) {
      return callback(null, 'Skipping Import');
    }

    return async.series([
      async.apply(importer.init, importOptions),
      async.apply(importer.run),
    ], (err, res) => {
      importer.cleanup(() =>
        // Note that the cleanup errors and results are ignored.
        callback(err, res));
    });
  };

  /**
   * Run the application.
   */
  const run = ({ exportOptions, importOptions, logLevel }) => {
    async.series({
      init: async.asyncify(async.apply(init, logLevel)),
      export: async.apply(doExport, exportOptions),
      import: async.apply(doImport, importOptions),
    }, (err, res) => {
      if (err) {
        winston.error('Application Failed', err);
        return;
      }
      winston.info('Application Success', res);
    });
  };

  // Reveal the public functions
  return {
    run,
  };
})();
