/**
 * The configuration options for pooling behaviour and connection to the source database.
 *
 * These options will be passed to mysql.createPool(options).
 * Refer to https://github.com/mysqljs/mysql
 */
module.exports = {
  host: 'localhost',
  port: 33060,
  database: 'oscar_15',
  user: 'root',
  password: '',
  connectionLimit: 10, // The maximum number of connections to create at once.
};
