// Import npm modules
const _ = require('lodash');
const archiver = require('archiver');
const async = require('async');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const winston = require('winston');

// Import local modules
const dbFactory = require('../db/dbFactory');

/**
 * This modules exports data from a source EMR database in a format that can later be imported
 * into the Universal Schema.
 *
 * The end result is a zip file containing multiple csv files.
 */
module.exports = (() => {
  /**
   * The default options to be used, if unspecified by user.
   */
  const defaultOptions = {
    parallelTasks: 10,
    connectionWaitAttempts: 60,
    connectionWaitMs: 60000, // 30 seconds
  };

  let options;
  let tasks;
  let db;

  // Returns the number of rows and ms
  const exportTask = (taskName, sourceQuery, autoResults, callback) => {
    const start = Date.now();
    const filename = `${taskName}.csv`;
    const filepath = path.join(options.exportDir, filename);

    db.exportData(sourceQuery, filepath, (err, res) => {
      if (err) {
        return callback(err);
      }
      const elapsedSec = (Date.now() - start) / 1000;
      winston.verbose(`    CSV Downloaded ${filename} (${res.rows} rows in ${elapsedSec} sec)`);
      return callback(err, { rows: res.rows });
    });
  };

  function runTasks(callback) {
    winston.info(`  Download Started (${options.parallelTasks} in parallel)`);
    const start = Date.now();

    async.auto(tasks, options.parallelTasks, (err, res) => {
      const elapsedSec = (Date.now() - start) / 1000;

      if (err) {
        return callback(err);
      }

      const rows = _.sumBy(_.toArray(res), t => (t.rows ? t.rows : 0));

      winston.info(`  Download Completed (${rows} rows in ${elapsedSec} sec)`);
      return callback(err, res);
    });
  }

  function removeExportDirectory(callback) {
    if (!options.archivePath) {
      winston.info('  Remove Export Directory Skipped');
      return callback(null);
    }

    winston.info('  Remove Export Directory Started');
    const start = Date.now();

    return rimraf(options.exportDir, (err, res) => {
      const elapsedSec = (Date.now() - start) / 1000;
      winston.info(`  Remove Export Directory Completed (${elapsedSec} sec)`);
      return callback(err, res);
    });
  }

  function populateTasks(mapping) {
    winston.info('  Populating Tasks Started');

    const t = {
      start: [async.constant('start')],
      'top-level': ['clinic', 'practitioner', 'patient', 'patient-practitioner', async.constant('top-level')],
    };

    _.forEach(mapping, (val) => {
      let taskName;
      let dependsOn;

      if (val.target === 'Clinic') {
        taskName = 'clinic';
        dependsOn = 'start';
      } else if (val.target === 'Practitioner') {
        taskName = 'practitioner';
        dependsOn = 'clinic';
      } else if (val.target === 'Patient') {
        taskName = 'patient';
        dependsOn = 'practitioner';
      } else if (val.target === 'PatientPractitioner') {
        taskName = 'patient-practitioner';
        dependsOn = 'patient';
      } else if (val.target === 'Entry') {
        taskName = `entry-${val.entryId}`;
        dependsOn = 'top-level';
      } else if (val.target === 'EntryAttribute') {
        taskName = `entry-attribute-${val.attributeId}`;
        dependsOn = `entry-${val.attributeId.substring(0, 3)}`;
      } else if (val.target === 'EntryState') {
        taskName = `entry-state-${val.entryId}`;
        dependsOn = `entry-${val.entryId}`;
      } else {
        throw new Error(`Unrecognized target in mapping (${val.target})`);
      }

      const newTask = [dependsOn, async.apply(exportTask, taskName, val.query)];
      t[taskName] = newTask;

      winston.verbose(`    Task ${taskName} depends on ${dependsOn}`);
    });

    winston.info(`  Populating Tasks Completed (${Object.keys(t).length} tasks)`);
    return t;
  }

  // Any cleanup work that is required by the exporter. Close connections, etc.
  function cleanup(callback) {
    winston.info('Cleanup Started');
    const start = Date.now();

    async.series([
      async.apply(db.cleanup),
    ], (err, res) => {
      const elapsedSec = (Date.now() - start) / 1000;
      winston.info(`Cleanup Completed (${elapsedSec} sec)`);
      return callback(err, res);
    });
  }

  function compress(callback) {
    if (!options.archivePath) {
      winston.info('  Compress Skipped');
      return callback(null);
    }

    winston.info('  Compress Started');
    const start = Date.now();

    // Create the archiver and output.
    const archive = archiver.create('zip', {});
    const archiveOutput = fs.createWriteStream(options.archivePath);
    archive.pipe(archiveOutput);

    // Listen for all archive data to be written
    archiveOutput.on('close', (err, res) => {
      const elapsedSec = (Date.now() - start) / 1000;
      winston.info(`  Compress Complete (${elapsedSec} sec)`, res);
      return callback(err, res);
    });

    archive.directory(options.exportDir, '');
    archive.finalize();

    return false;
  }

  /**
   * This function runs the exporter to actually export the query data to files.
   *
   * Ths exporter.init function must be called before this function.
   */
  function run(callback) {
    winston.info('Export Started');
    const start = Date.now();

    async.series([
      async.apply(runTasks),
      async.apply(compress),
      async.apply(removeExportDirectory),
    ], (err) => {
      const elapsedSec = (Date.now() - start) / 1000;
      winston.info(`Export Complete (${elapsedSec} sec)`);
      return callback(err);
    });
  }

  function waitForConnection(times, interval, callback) {
    winston.info('Wait for Connection Started');
    const start = Date.now();

    const testConnection = cb => db.query({ q: 'select 1' }, cb);
    let i = 0;
    async.retry({
      times,
      interval,
      errorFilter: (err) => {
        i += 1;

        const refused = _.includes(err.error, 'ECONNREFUSED');
        winston.info(`  Connection Refused ${i}/${times}`);
        winston.debug(err.error);
        return refused;
      },
    }, testConnection, (err) => {
      if (err) {
        return callback(err);
      }

      const elapsedSec = (Date.now() - start) / 1000;
      winston.info(`Wait for Connection Completed (${elapsedSec} sec)`);
      return callback(err);
    });
  }

  /**
   * This function initialize the exporter module by preparing the database connections
   * and transforming the queries mappings into executable async tasks.
   *
   * This function must be run before calling exporter.run.
   */
  function init(userOptions, callback) {
    winston.info('Init Started');
    const start = Date.now();

    // Merge the default options with the supplied options.
    options = Object.assign({}, defaultOptions, userOptions);

    // Pretty print the merged options.
    winston.info('  Options');
    _.forEach(_.keys(options), (key) => {
      winston.info(`    ${key} = ${options[key]}`);
    });

    const mapping = require(options.mappingFile);
    db = dbFactory.get(options.dbConfig.dialect);

    tasks = populateTasks(mapping);

    return async.series([
      // Create a temporary export directory.
      async.apply(fs.mkdir, options.exportDir),
      // TODO - hack
      async.apply(fs.chmod, options.exportDir, '777'),
      // Open the database connection.
      async.apply(db.init, options.dbConfig),
      // Wait for a database connection.
      async.apply(waitForConnection, options.connectionWaitAttempts, options.connectionWaitMs),
    ], (err, res) => {
      if (err) { return callback(err); }

      const elapsedSec = (Date.now() - start) / 1000;
      winston.info(`Init Complete (${elapsedSec} sec)`);
      return callback(err, res);
    });
  }

  // Reveal the public functions
  return {
    init,
    run,
    cleanup,
  };
})();
