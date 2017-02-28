const mysql = require('mysql');
const winston = require('winston');

module.exports = (() => {
  let pool;

  const init = (config, callback) => {
    winston.verbose('source.init()');
    pool = mysql.createPool(config);
    callback(null);
  };

  const cleanup = (callback) => {
    winston.verbose('source.cleanup()');
    pool.end(callback);
  };

  const query = ({ q }, callback) => {
    winston.debug('source.query()', { q });
    pool.query(q, (err, res) => {
      if (err) {
        return callback({
          message: 'Unable to run source query',
          query: q,
          error: err,
        });
      }
      return callback(err, res);
    });
  };

  return {
    init,
    cleanup,
    query,
  };
})();
