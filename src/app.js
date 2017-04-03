// Import npm modules
const async = require('async');
const winston = require('winston');

// Import local modules
const exporter = require('./exporter/exporter');
const importer = require('./importer/importer');

module.exports = (() => {
  const run = ({ exportOptions, importOptions, logLevel }) => {
    // Configure the logger.
    // This must be done before loading the other local modules that utilize winston.
    require('./configureLogger')({
      level: logLevel,
      logPath: 'logs/log.txt',
    });

    function doExport(callback) {
      if (exportOptions === {}) {
        return callback(null, 'Skipping Export');
      }

      return async.series([
        async.apply(exporter.init, exportOptions),
        async.apply(exporter.run),
      ], (err, res) => {
        // TODO - chain propertly. Note this is async.
        exporter.cleanup((cErr, cRes) => {
          winston.info('FINISHED EXPORT', err, res);
          return callback(err, res);
        });
      });
    }

    function doImport(callback) {
      if (importOptions === {}) {
        return callback(null, 'Skipping Import');
      }

      return async.series([
        async.apply(importer.init, importOptions),
        async.apply(importer.run),
      ], (err, res) => {
        // TODO - chain propertly. Note this is async.
        importer.cleanup((cErr, cRes) => {
          winston.info('FINISHED IMPORT', err, res);
          return callback(err, res);
        });
      });
    }

    async.series({
      export: doExport,
      import: doImport,
    }, (err, res) => {
      // TODO - remove this
      console.log(err);

      winston.info('TOTALLY FINISHED', err, res);
    });
  };

  return {
    run,
  };
})();
