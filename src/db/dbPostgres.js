const async = require('async');
const fs = require('fs');
const pg = require('pg');
const copyFrom = require('pg-copy-streams').from;
const winston = require('winston');

/**
 * This module handles all interactions with the target database.
 */
module.exports = (() => {
  // The current pool of connections. This will not be instantiated until the init function
  // is called.
  let pool;

  const query = ({ q, p = [] }, callback) => {
    winston.debug('target.query()', q);
    pool.query(q, p, (err, res) => {
      if (err) {
        return callback({
          message: 'Unable to run target query',
          query: q,
          parameters: p,
          error: err,
        });
      }
      return callback(err, res);
    });
  };

  /**
   * Initializes the connection pool for the target database.
   * @param config A configuration object to be passed to pg.Pool.
   * See https://github.com/brianc/node-postgres
   *
   * Function will callback with the current version of the target database.
   */
  const init = (config, callback) => {
    winston.verbose('target.init()');
    pool = new pg.Pool(config);
    query({ q: 'SELECT version();' }, callback);
  };

  /**
   * Cleanup all connections to the target database.
   */
  const cleanup = (callback) => {
    winston.verbose('target.cleanup()');
    pool.end(callback);
  };

  // FIXME: Remove this and get runScriptFile to work with query instead of query2.
  const query2 = (q, callback) => {
    winston.debug('in query2?', q);
    query({ q }, callback);
  };

  const exportData = (selectQuery, exportPath, callback) => {
    const escapedExportPath = exportPath.split('\\').join('\\\\');

    const exportQuery = `
      COPY (${selectQuery})
      TO '${escapedExportPath}'
      FORCE QUOTE *
      DELIMITER ','
      CSV NULL AS '\\N'
      ENCODING 'LATIN1' ESCAPE '\\';
    `;

    winston.debug('db_postgres.exportData()', exportQuery);

    pool.query(exportQuery, (err, res) => {
      if (err) {
        return callback({
          message: 'Unable to export',
          selectQuery,
          exportQuery,
          error: err,
        });
      }
      return callback(err, { rows: res.affectedRows });
    });
  };

  const importFile = (table, filepath, callback) => {
    winston.debug('db_postgres.importFile', { table, filepath });

    const statement = `COPY ${table} FROM STDIN DELIMITER ',' CSV NULL AS '\\N' ENCODING 'LATIN1' ESCAPE '\\';`;

    winston.debug('Copy Statement', statement);

    pool.connect((err, client, done) => {
      if (err) {
        return callback(err);
      }

      function allDone(a, b) {
        done();
        callback(a, b);
      }

      const stream = client.query(copyFrom(statement));
      const fileStream = fs.createReadStream(filepath);
      fileStream.on('error', allDone);
      stream.on('error', allDone);
      stream.on('end', allDone);
      fileStream.pipe(stream);
    });

    // pool.query(statement, (err, res) => {
    //   callback(err, res);
    // });
  };
  // const importFile = (table, filepath, callback) => {
  //   winston.debug('db_postgres.importFile', { table, filepath });
  //
  //   const statement = `\\COPY ${table} FROM '${filepath}' DELIMITER ',' CSV NULL AS '\\N';`;
  //
  //   winston.debug('Copy Statement', statement);
  //
  //   pool.query(statement, (err, res) => {
  //     callback(err, res);
  //   });
  // };

  /**
   * Reads the content of a file and runs it as a query against the target database.
   *
   * @param path A fully qualified path to the file. Must be in utf8 format.
   */
  const runScriptFile = (path, callback) => {
    winston.debug('target.runScriptFile');
    async.waterfall([
      async.constant(path, 'utf8'),
      fs.readFile,
      query2,
    ], callback);
  };

  return {
    init,
    cleanup,
    query,
    runScriptFile,
    query2,
    importFile,
  exportData,
};
})();
