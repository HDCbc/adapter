const _ = require('lodash');
const async = require('async');
const winston = require('winston');

module.exports = (() => {
  let tasks;

  // FIXME: SHould be configurable..possibly by record.
  const MAIN_TASK_LIMIT = 10;
  const NUM_THREADS = 3;
  const SELECT_CHUNK = 50000;
  const INSERT_CHUNK = 2500;

  const taskCreate = (taskName, target, createQuery, callback) => {
    winston.verbose('tasks.taskCreate()', { taskName });
    target.query({ q: createQuery }, callback);
  };

  const buildStatement = (insert, rows) => {
    const params = [];
    const chunks = [];
    rows.forEach((row) => {
      const valueClause = [];
      Object.keys(row).forEach((p) => {
        params.push(row[p]);
        valueClause.push(`$${params.length}`);
      });
      chunks.push(`(${valueClause.join(', ')})`);
    });
    return {
      text: insert + chunks.join(', '),
      values: params,
    };
  };

  // Retrieve the data from the source emr database.
  const getData = (thread, task, source, sourceQuery, offset, limit, callback) => {
    winston.debug('getData()', { task, thread, query: `${sourceQuery.substring(0, 50)}...` });
    const query = _.replace(_.replace(sourceQuery, '{limit}', limit), '{offset}', offset);

    source.query({ q: query, limit, offset }, callback);
  };

  // Insert a chunk of data into the vault.
  const insertDataChunk = (thread, task, target, baseQuery, sourceRows, callback) => {
    winston.debug('insertData()', { task, thread, rowCount: sourceRows.length });

    const statement = buildStatement(baseQuery, sourceRows);

    return target.query({ q: statement.text, p: statement.values }, (err) => {
      // Note we discard the results.
      return callback(err);
    });
  };

  const insertData = (thread, task, target, baseQuery, sourceRows, callback) => {
    winston.debug('storeData()', { task, thread, rowCount: sourceRows.length });

    const chunkRows = _.chunk(sourceRows, INSERT_CHUNK);

    async.each(chunkRows, (chunk, cb) => {
      insertDataChunk(thread, task, target, baseQuery, chunk, cb);
    }, callback);
  };

  const insertBatch = (thread, task, source, sourceQuery, target, insertQuery, offset, limit, callback) => {
    winston.debug('insertBatch()', { task, thread });
    // FIXME: Be more asyncy
    getData(thread, task, source, sourceQuery, offset, limit, (sourceErr, sourceRows) => {
      if (sourceErr) {
        return callback(sourceErr);
      }
      if (sourceRows === undefined || sourceRows.length === 0) {
        return callback(null, sourceRows);
      }
      return insertData(thread, task, target, insertQuery, sourceRows, (storeErr, storeResults) => {
        return callback(null, { sourceRows });
      });
    });
  };

  function taskTransferThread(thread, taskName, source, sourceQuery, target, insertQuery, startOffset, increment, limit, callback) {
    let offset = startOffset;
    const results = [];
    async.doWhilst(
      (cb) => {
        insertBatch(thread, taskName, source, sourceQuery, target, insertQuery, offset, increment, cb);
      },
      (stats) => {
        results.push(stats);
        offset += increment;
        return stats.sourceRows === limit;
      }, (err, res) => {
        callback(err);
      });
  }

  const taskTransfer = (taskName, source, sourceQuery, target, targetBaseQuery, autoResults, callback) => {
    winston.verbose('tasks.taskTransfer()', { taskName });

    const threadArray = _.range(NUM_THREADS);

    async.each(
      threadArray,
      (index, cb) => {
        const startOffset = SELECT_CHUNK * index;
        const incrementOffset = SELECT_CHUNK * NUM_THREADS;
        return taskTransferThread(index, taskName, source, sourceQuery, target, targetBaseQuery, startOffset, incrementOffset, SELECT_CHUNK, cb);
      },
      (err) => {
        return callback(err);
      });
  };

  const taskSync = (taskName, target, syncQuery, syncParams, autoResults, callback) => {
    winston.verbose('tasks.taskSync()', { taskName });
    target.query({ q: syncQuery, p: syncParams }, (err) => {
      return callback(err);
    });
  };

  function createTasks(mapping, source, target) {
    const entryTasks = {
      'sync-records': ['sync-patient-practitioner', async.constant('forty two')],
    };

    _.forEach(mapping, (val, index) => {
      const table = `etl.table_${index}`;
      let createQuery;
      let insertQuery;
      let syncQuery;
      let syncParams;

      if (val.target === 'Clinic') {
        createQuery = `CREATE TABLE ${table} (name text, hdc_reference text, emr_clinic_id text, emr_reference text)`;
        insertQuery = `INSERT INTO ${table} (name, hdc_reference, emr_clinic_id, emr_reference) VALUES `;
        syncQuery = 'SELECT * FROM etl.sync_clinic($1)';
        syncParams = [table];

        entryTasks['create-clinic'] = async.apply(taskCreate, 'create-clinic', target, createQuery);
        entryTasks['fetch-clinic'] = ['create-clinic', async.apply(taskTransfer, 'fetch-clinic', source, val.query, target, insertQuery)];
        entryTasks['sync-clinic'] = ['fetch-clinic', async.apply(taskSync, 'sync-clinic', target, syncQuery, syncParams)];
      } else if (val.target === 'Practitioner') {
        createQuery = `CREATE TABLE ${table} (emr_clinic_id text, name text, identifier text, identifier_type text, emr_practitioner_id text, emr_reference text)`;
        insertQuery = `INSERT INTO ${table} (emr_clinic_id, name, identifier, identifier_type, emr_practitioner_id, emr_reference) VALUES `;
        syncQuery = 'SELECT * FROM etl.sync_practitioner($1)';
        syncParams = [table];

        entryTasks['create-practitioner'] = async.apply(taskCreate, 'create-practitioner', target, createQuery);
        entryTasks['fetch-practitioner'] = ['create-practitioner', async.apply(taskTransfer, 'fetch-practitioner', source, val.query, target, insertQuery)];
        entryTasks['sync-practitioner'] = ['fetch-practitioner', 'sync-clinic', async.apply(taskSync, 'sync-practitioner', target, syncQuery, syncParams)];
      } else if (val.target === 'Patient') {
        createQuery = `CREATE TABLE ${table} (emr_clinic_id text, emr_patient_id text, emr_reference text)`;
        insertQuery = `INSERT INTO ${table} (emr_clinic_id, emr_patient_id, emr_reference) VALUES `;
        syncQuery = 'SELECT * FROM etl.sync_patient($1)';
        syncParams = [table];

        entryTasks['create-patient'] = async.apply(taskCreate, 'create-patient', target, createQuery);
        entryTasks['fetch-patient'] = ['create-patient', async.apply(taskTransfer, 'fetch-patient', source, val.query, target, insertQuery)];
        entryTasks['sync-patient'] = ['fetch-patient', 'sync-practitioner', async.apply(taskSync, 'sync-patient', target, syncQuery, syncParams)];
      } else if (val.target === 'PatientPractitioner') {
        createQuery = `CREATE TABLE ${table} (emr_patient_id text, emr_practitioner_id text, emr_patient_practitioner_id text, emr_reference text)`;
        insertQuery = `INSERT INTO ${table} (emr_patient_id, emr_practitioner_id, emr_patient_practitioner_id, emr_reference) VALUES `;
        syncQuery = 'SELECT * FROM etl.sync_patient_practitioner($1)';
        syncParams = [table];

        entryTasks['create-patient-practitioner'] = async.apply(taskCreate, 'create-patient-practitioner', target, createQuery);
        entryTasks['fetch-patient-practitioner'] = ['create-patient-practitioner', async.apply(taskTransfer, 'fetch-patient-practitioner', source, val.query, target, insertQuery)];
        entryTasks['sync-patient-practitioner'] = ['fetch-patient-practitioner', 'sync-patient', async.apply(taskSync, 'sync-patient-practitioner', target, syncQuery, syncParams)];
      } else if (val.target === 'Entry') {
        createQuery = `CREATE TABLE ${table} (emr_patient_id text, emr_id text)`;
        insertQuery = `INSERT INTO ${table} (emr_patient_id, emr_id) VALUES `;
        syncQuery = 'SELECT * FROM etl.sync_entry($1, $2)';
        syncParams = [table, val.sourceTable];

        entryTasks[`create-entry-${val.entryId}`] = async.apply(taskCreate, `create-entry-${val.entryId}`, target, createQuery);
        entryTasks[`fetch-entry-${val.entryId}`] = [`create-entry-${val.entryId}`, async.apply(taskTransfer, `fetch-entry-${val.entryId}`, source, val.query, target, insertQuery)];
        entryTasks[`sync-entry-${val.entryId}`] = [`fetch-entry-${val.entryId}`, 'sync-records', async.apply(taskSync, `sync-entry-${val.entryId}`, target, syncQuery, syncParams)];
      } else if (val.target === 'EntryAttribute') {
        createQuery = `CREATE TABLE ${table} (emr_entry_id text, code_system text, code_value text, text_value text, date_value date, emr_id text, effective_date date, emr_reference text)`;
        insertQuery = `INSERT INTO ${table} (emr_entry_id, code_system, code_value, text_value, date_value, emr_id, effective_date, emr_reference) VALUES `;
        syncQuery = 'SELECT * FROM etl.sync_entry_attribute($1, $2, $3)';
        syncParams = [table, val.sourceTable, val.attributeId];

        const attributeId = val.attributeId.substring(0, 3);
        entryTasks[`create-attr-${val.attributeId}`] = async.apply(taskCreate, `create-attr-${val.attributeId}`, target, createQuery);
        entryTasks[`fetch-attr-${val.attributeId}`] = [`create-attr-${val.attributeId}`, async.apply(taskTransfer, `fetch-attr-${val.attributeId}`, source, val.query, target, insertQuery)];
        entryTasks[`sync-attr-${val.attributeId}`] = [`fetch-attr-${val.attributeId}`, `sync-entry-${attributeId}`, async.apply(taskSync, `sync-attr-${val.attributeId}`, target, syncQuery, syncParams)];
      } else if (val.target === 'EntryState') {
        createQuery = `CREATE TABLE ${table} (emr_entry_id text, state text, effective_date timestamp with time zone, emr_reference text)`;
        insertQuery = `INSERT INTO ${table} (emr_entry_id, state, effective_date, emr_reference) VALUES `;
        syncQuery = 'SELECT * FROM etl.sync_entry_state($1, $2)';
        syncParams = [table, val.sourceTable];

        entryTasks[`create-estate-${val.entryId}`] = async.apply(taskCreate, `create-estate-${val.entryId}`, target, createQuery);
        entryTasks[`fetch-estate-${val.entryId}`] = [`create-estate-${val.entryId}`, async.apply(taskTransfer, `fetch-estate-${val.entryId}`, source, val.query, target, insertQuery)];
        entryTasks[`sync-estate-${val.entryId}`] = [`fetch-estate-${val.entryId}`, `sync-entry-${val.entryId}`, async.apply(taskSync, `sync-estate-${val.entryId}`, target, syncQuery, syncParams)];
      }

      // FIXME: Throw an error for no match
    });

    return entryTasks;
  }

  const init = (mapping, source, target, callback) => {
    winston.verbose('tasks.init()');
    tasks = createTasks(mapping, source, target);
    callback(null);
  };

  const execute = (callback) => {
    winston.verbose('tasks.execute()');
    async.auto(tasks, MAIN_TASK_LIMIT, callback);
  };

  return {
    init,
    execute,
  };
})();
