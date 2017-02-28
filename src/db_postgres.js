const async = require('async');
const fs = require('fs');
const pg = require('pg');
const winston = require('winston');

/**
 * This module handles all interactions with the target database.
 */
module.exports = (() => {
  // The current pool of connections. This will not be instantiated until the init function
  // is called.
  let pool;

  const query = ({ q, p = [] }, callback) => {
    winston.debug('target.query()', { q: q.substring(0, 100) + '...', p: p.length <= 5 ? p : p.length });
    pool.query(q, p, (err, res) => {
      if (err) {
        return callback({
          message: 'Unable to run target query',
          query: q,
          parameters: p,
          error: err
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
    query({ q }, callback);
  };

  /**
   * Reads the content of a file and runs it as a query against the target database.
   *
   * @param path A fully qualified path to the file. Must be in utf8 format.
   */
  const runScriptFile = (path, callback) => {
    winston.verbose('target.runScriptFile');
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
  };
})();
