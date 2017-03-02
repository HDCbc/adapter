const fs = require('fs');
const path = require('path');
const printf = require('printf');
const winston = require('winston');

module.exports = (({
  level = 'info',
  filename = './logs/log.txt',
  maxSize = 1000000, // 1 Megabyte
  maxFiles = 100,
  tailable = true,
  zippedArchive = true,
}) => {
  const createFileTransport = () => {
    // Create the log directory if it does not already exist
    // Because Winston is too lazy to do it. Thanks Winston.
    if (!fs.existsSync(path.dirname(filename))) {
      fs.mkdirSync(path.dirname(filename));
    }

    return new winston.transports.File({
      filename,
      maxSize,
      maxFiles,
      tailable,
      zippedArchive,
    });
  };

  // const createConsoleTransport = () => new (winston.transports.Console)({
  //   formatter(options) {
  //     const time = new Date().toISOString();
  //     const lvl = options.level.toUpperCase();
  //     const message = options.message ? options.message : '';
  //     const meta = options.meta && Object.keys(options.meta).length ? ` ${JSON.stringify(options.meta)}` : '';
  //
  //       // 7 characters to fit "VERBOSE"
  //     return printf('%s %-7s %s %s', time, lvl, message, meta);
  //   },
  // });

  winston.configure({
    level,
    transports: [
      // createConsoleTransport(),
      createFileTransport(),
    ],
  });
});
