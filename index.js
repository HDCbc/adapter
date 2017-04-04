// Import npm modules
const commander = require('commander');
const moment = require('moment');
const path = require('path');

// Import local modules
const app = require('./src/app');
const pjson = require('./package.json');

function getParameters() {
  // Specify the different command line options.
  // Note that these options will be served as documentation with the help parameter.
  commander
    .version(pjson.version)
    .option('-e, --export', 'Export Mode')
    .option('-d, --export-dir [type]', 'The directory to export the files to')
    .option('-c, --compress', 'Compress/Uncompress')
    .option('-m, --mapping-file [type]', 'Path to the query mapping file')
    .option('-s, --source-config-file [type]', 'Path to the source config file')
    .option('-t, --target-config-file [type]', 'Path to the target config file')
    .option('-i, --import', 'Import Mode')
    .option('-f, --import-file [type]', 'The zip file of files to import.')
    .option('-F, --import-dir [type]', 'The directory of files to import.')
    .option('-l, --log-level [type]', 'The logging level (info/verbose)');

  // Add additional help documentation in the form of examples.
  // Note that this must be done before called .parse()
  // TODO - Flesh out the help documentation
  commander.on('--help', () => {
    /* eslint-disable no-console */
    console.log('  Adapters are typically run in two different scenarios:');
    console.log('');
    console.log('  1. The source and target database are running on the same server.');
    console.log('  This is the simplest case, as the adapter only needs to be installed on a single server, and can run a complete ETL of the data with one command. Basically the adapter needs to be put into both Export & Import mode while specifying all parameters required by both');
    console.log('    $ npm start -- -e -m ./config/mapping.js -d ./exportDir -s ./config/source.js -i -t ./config/target.js');
    console.log('');
    console.log('  2. The source and target database are running on different servers without database connectivity between the two servers.');
    console.log('  In this case the adapter must be installed on each server. The adapter will first be run on the source server and will generate a compressed file.');
    console.log('');
    /* eslint-enable no-console */
  });

  // Parse the command line arguments passed into the application.
  commander.parse(process.argv);
}

function validateParameters(options) {
  const exportOptions = {};
  const importOptions = {};
  const time = moment().format('YYYY_MM_DD_HH_mm_ss');

  if (!options) {
    throw new Error('Undefined options');
  }

  if (options.export) {
    if (!options.exportDir) {
      throw new Error('Export Mode requires exportDir parameter');
    }

    if (!options.sourceConfigFile) {
      throw new Error('Export mode requires sourceConfigFile parameter');
    }

    if (!options.mappingFile) {
      throw new Error('Export mode requires mappingFile parameter');
    }

    const baseDir = path.resolve(options.exportDir);

    exportOptions.exportDir = path.join(baseDir, time);
    exportOptions.mappingFile = path.resolve(options.mappingFile);
    exportOptions.dbConfig = path.resolve(options.sourceConfigFile);
    exportOptions.archivePath = options.compress ? path.join(options.exportBaseDir, `${time}.zip`) : undefined;
  }

  if (options.import) {
    if (!options.targetConfigFile) {
      throw new Error('Import mode requires target parameter');
    } else {
      importOptions.dbConfig = path.resolve(options.targetConfigFile);
    }

    if (options.export && options.compress) {
      importOptions.importFile = path.join(options.exportBaseDir, `${time}.zip`);
    } else if (options.importFile) {
      importOptions.importFile = options.importFile;
    }

    if (options.export) {
      importOptions.importDir = exportOptions.exportDir;
    } else if (options.importDir) {
      importOptions.importDir = options.importDir;
    } else {
      throw new Error('Import mode requires importDir parameter if not in Export mode');
    }
  }

  return {
    exportOptions,
    importOptions,
    logLevel: options.logLevel,
  };
}

getParameters(commander);
const options = validateParameters(commander);
app.run(options);
