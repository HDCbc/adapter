/**
 * The configuration options for pooling behaviour and connection to the target database.
 *
 * These options will be passed to new pg.Pool(options).
 * Refer to https://github.com/brianc/node-postgres
 */
module.exports = {
  host: 'localhost',
  port: 5432,
  database: 'vault',
  user: 'postgres',
  password: '',
  max: 10, // The maximum number of clients in the pool.
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
};
