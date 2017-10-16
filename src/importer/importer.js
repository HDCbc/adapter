// Import npm modules
const _ = require('lodash');
const async = require('async');
const decompress = require('decompress');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

// Import local modules
const db = require('../db/dbPostgres');

module.exports = (() => {
  let options;
  let tasks;

  const defaultOptions = {
    parallelTasks: 10,
  };

  const uploadData = (table, filepath, callback) => {
    db.importFile(table, filepath, (err, res) => callback(err, res));
  };

  const importTask = (table, filepath, autoResults, callback) => {
    const start = Date.now();

    async.series({
      uploadData: async.apply(uploadData, table, filepath),
    }, (err, res) => {
      const elapsedSec = (Date.now() - start) / 1000;
      if (err) {
        winston.error(`THERE IS AN ERROR FOR THE TASK ${table} ${filepath}`, err);
        return callback(err);
      }

      // TODO - display row counts
      winston.verbose(`    CSV Uploaded ${path.basename(filepath)} (Some ### in ${elapsedSec} sec)`);
      return callback(err, res);
    });
  };

  const populateTasks = (dataDir, callback) => {
    winston.info('  Populating Tasks Started');

    let createQuery;
    tasks = {
      start: [async.constant('start')],
    };

    fs.readdir(dataDir, (err, files) => {
      if (files.length === 0) {
        return callback(`No files found in ${dataDir}`);
      }
      _.forEach(files, (filename, index) => {
        const filepath = path.join(dataDir, filename);
        let table = `etl.table_${index}`;
        let dependsOn;
        let syncQuery;
        let syncParams;

        if (filename.startsWith('clinic')) {
          table = 'etl.clinic';
          createQuery = 'CREATE TABLE IF NOT EXISTS etl.clinic (name text, hdc_reference text, emr_clinic_id text, emr_reference text)';
          dependsOn = 'start';
          syncQuery = 'SELECT * FROM etl.sync_clinic($1)';
          syncParams = [table];
        } else if (filename.startsWith('practitioner')) {
          table = 'etl.practitioner';
          createQuery = 'CREATE TABLE IF NOT EXISTS etl.practitioner (emr_clinic_id text, name text, identifier text, identifier_type text, emr_practitioner_id text, emr_reference text)';
          dependsOn = 'clinic.csv';
          syncQuery = 'SELECT * FROM etl.sync_practitioner($1)';
          syncParams = [table];
        } else if (filename.startsWith('patient-practitioner')) {
          table = 'etl.patient_practitioner';
          createQuery = 'CREATE TABLE IF NOT EXISTS etl.patient_practitioner (emr_patient_id text, emr_practitioner_id text, emr_patient_practitioner_id text, emr_reference text)';
          dependsOn = 'patient.csv';
          syncQuery = 'SELECT * FROM etl.sync_patient_practitioner($1)';
          syncParams = [table];
        } else if (filename.startsWith('patient-state')) { // Must be after patient-practitioner
          table = 'etl.patient_state';
          createQuery = 'CREATE TABLE IF NOT EXISTS etl.patient_state (emr_patient_id text, state text, effective_date timestamp with time zone, emr_reference text)';
          dependsOn = 'patient.csv';
          syncQuery = 'SELECT * FROM etl.sync_patient_state($1)';
          syncParams = [table];
        } else if (filename.startsWith('patient')) { // Must be after patient-practitioner and patient-state
          table = 'etl.patient';
          createQuery = 'CREATE TABLE IF NOT EXISTS etl.patient (emr_clinic_id text, emr_patient_id text, emr_reference text)';
          dependsOn = 'practitioner.csv';
          syncQuery = 'SELECT * FROM etl.sync_patient($1)';
          syncParams = [table];
        } else if (filename.startsWith('entry-attribute')) {
          table = 'etl.entry_attribute';
          createQuery = 'CREATE TABLE IF NOT EXISTS etl.entry_attribute (source_table text, attribute_id numeric(6,3), emr_entry_id text, code_system text, code_value text, text_value text, date_value date, boolean_value boolean, numeric_value numeric(18,6), emr_id text, effective_date date, emr_reference text)';
          dependsOn = `entry-${filename.substring(16, 19)}.csv`;
          syncQuery = 'SELECT * FROM etl.sync_entry_attribute($1)';
          syncParams = [table];
        } else if (filename.startsWith('entry-state')) {
          table = 'etl.entry_state';
          createQuery = 'CREATE TABLE IF NOT EXISTS etl.entry_state (source_table text, emr_entry_id text, state text, effective_date timestamp with time zone, emr_reference text)';
          dependsOn = `entry-${filename.substring(12, 15)}.csv`;
          syncQuery = 'SELECT * FROM etl.sync_entry_state($1)';
          syncParams = [table];
        } else if (filename.startsWith('entry')) { // Must be after entry-attribute and state
          table = 'etl.entry';
          createQuery = 'CREATE TABLE IF NOT EXISTS etl.entry (source_table text, emr_id text, emr_patient_id text)';
          dependsOn = 'patient-practitioner.csv';
          syncQuery = 'SELECT * FROM etl.sync_entry($1)';
          syncParams = [table];
        } else {
          throw new Error(`Unrecognized filename format (${filename})`);
        }

        tasks[filename] = [dependsOn,
          async.apply(importTask, table, filepath)];
        winston.verbose(`    Task ${filename} depends on ${dependsOn}`);
      });

      winston.info(`  Populating Tasks Completed (${Object.keys(tasks).length} tasks from ${files.length} files)`);
      return callback(null);
    });
  };

  // Any cleanup work. Close connections, etc.
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

  function runTasks(callback) {
    winston.info(`  Upload Started (${options.parallelTasks} in parallel)`);
    const start = Date.now();

    async.auto(tasks, options.parallelTasks, (err, res) => {
      const elapsedSec = (Date.now() - start) / 1000;

      if (err) {
        return callback(err);
      }

      // const rows = _.sumBy(_.toArray(res), t => (t.rows ? t.rows : 0));

      winston.info(`  Upload Completed (${-42} rows in ${elapsedSec} sec)`);
      return callback(err, res);
    });
  }

  function uncompress(callback) {
    if (!options.importFile) {
      winston.info('  Decompress Skipped');
      return callback(null);
    }

    winston.info('  Decompress Started');
    winston.info(`    Decompress Source ${options.importFile}`);
    winston.info(`    Decompress Source ${options.importDir}`);

    const start = Date.now();

    decompress(options.importFile, options.importDir)
      .then((files) => {
        const elapsedSec = (Date.now() - start) / 1000;
        winston.info(`  Decompress Completed (${elapsedSec} sec)`);
        return callback(null, files);
      });
      // TODO .catch(err => { return callback(err); });
  }

  function runScriptFile(taskName, relativePath, callback) {
    winston.info(`${taskName} Started`);
    const start = Date.now();

    db.runScriptFile(path.join(__dirname, relativePath), (err, res) => {
      if (err) {
        return callback(err);
      }

      const elapsedSec = (Date.now() - start) / 1000;
      winston.info(`${taskName} Completed (${elapsedSec} sec)`);
      return callback(err, res);
    });
  }

  function run(callback) {
    winston.info('Import Started');
    const start = Date.now();

    async.series([
      // Run an initialize script against the database.
      async.apply(runScriptFile, 'Recreate ETL Schema', './sql/createEtl.sql'),
      async.apply(runScriptFile, 'Truncate Universal Schema Data', './sql/truncateUniversal.sql'),
      // async.apply(db.runScriptFile, path.join(__dirname, './sql/disableUniversalTriggers.sql')),
      // async.apply(db.runScriptFile, path.join(__dirname, './sql/vacuum.sql')),
      async.apply(uncompress),
      async.apply(populateTasks, options.importDir),
      async.apply(runTasks),
      async.apply(runScriptFile, 'Synchronize Clinics', './sql/syncClinic.sql'),
      async.apply(runScriptFile, 'Synchronize Patients', './sql/syncPatient.sql'),
      async.apply(runScriptFile, 'Synchronize Practitioners', './sql/syncPractitioner.sql'),
      async.apply(runScriptFile, 'Synchronize Patient Practitioners', './sql/syncPatientPractitioner.sql'),
      async.apply(runScriptFile, 'Synchronize Entry', './sql/syncEntry.sql'),
      async.apply(runScriptFile, 'Synchronize Entry Attribute', './sql/syncEntryAttribute.sql'),
      async.apply(runScriptFile, 'Synchronize Entry State', './sql/syncEntryState.sql'),
      // async.apply(db.runScriptFile, path.join(__dirname, './sql/enableUniversalTriggers.sql')),
      async.apply(runScriptFile, 'Drop ETL', './sql/dropEtl.sql'),
      async.apply(runScriptFile, 'Full Vacuum', './sql/vacuum.sql'),
      // async.apply(removeTemp),
    ], (err) => {
      const elapsedSec = (Date.now() - start) / 1000;
      winston.info(`Import Complete (${elapsedSec} sec)`);
      return callback(err);
    });
  }

  function waitForConnection(callback) {
    winston.info('Wait for Connection Started');
    const start = Date.now();

    const testConnection = cb => db.query({ q: 'select 1' }, cb);

    async.retry({
      times: 60,
      internal: 1000,
      errorFilter(err) {
        winston.info(`  ${err}`);
        return true;
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

  function init(userOptions, callback) {
    winston.info('Init Started');

    // Merge the default options with the supplied options.
    options = Object.assign({}, defaultOptions, userOptions);

    if (!options.importDir) {
      options.importDir = path.join(
        path.dirname(options.importFile),
        path.basename(options.importFile, path.extname(options.importFile)));
    }

    // Pretty print the merged options.
    winston.info('  Options');
    _.forEach(_.keys(options), (key) => {
      winston.info(`    ${key} = ${options[key]}`);
    });

    return async.series([
      // Open the database connection.
      async.apply(db.init, options.dbConfig),
      async.apply(waitForConnection),

    ], callback);
  }

  // Reveal the public functions
  return {
    init,
    run,
    cleanup,
  };
})();
