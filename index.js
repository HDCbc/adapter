// Configure the logger.
// This must be done before loading the other local modules that utilize winston.
require('./src/configureLogger')({
  level: 'info',
  logPath: 'logs/log.txt',
});

const app = require('./src/app');

app.run();
