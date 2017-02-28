const winston = require('winston');

require('./src/configureLogger')({
  level: 'info',
  logPath: 'logs/log.txt',
});

winston.info('Index.js');
