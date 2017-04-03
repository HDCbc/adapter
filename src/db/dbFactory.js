const mysql = require('./dbMysql');
const postgres = require('./dbPostgres');

/**
 * This module handles all interactions with the target database.
 */
module.exports = (() => {
  const get = (dialect) => {
    switch (dialect) {
      case 'mysql':
        return mysql;
      case 'postgres':
        return postgres;
      default:
        throw new Error(`Unsupported database dialect (${dialect})`);
    }
  };

  return {
    get,
  };
})();
