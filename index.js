// Import npm modules
const moment = require('moment');
const nconf = require('nconf');
const path = require('path');

// Import local modules
const app = require('./src/app');
const pjson = require('./package.json');

function getParameters() {
  // 1. Overrides
  nconf.overrides({});
  // 2. Environmental variables
  nconf.env();
  // 3. Command line variables
  nconf.argv();

  // 4. Config file. If path was specified.
  if (nconf.get('configFile')) {
    nconf.file(nconf.get('configFile'));
  }

  // 5. Defaults
  nconf.defaults({
    logLevel: 'info',
  });
}

function validateParameters() {
  const exportOptions = {};
  const importOptions = {};
  const logLevel = nconf.get('logLevel');
  const time = moment().format('YYYY_MM_DD_HH_mm_ss');

  const exportMode = nconf.get('export');
  const exportDir = nconf.get('exportDir');
  const exportBaseDir = nconf.get('exportBaseDir');
  const source = nconf.get('source');
  const mappingFile = nconf.get('mappingFile');
  const compress = nconf.get('compress');

  const importMode = nconf.get('import');
  const target = nconf.get('target');
  const importFile = nconf.get('importFile');
  const importDir = nconf.get('importDir');

  if (exportMode) {
    if (!exportDir) {
      throw new Error('Export Mode requires exportDir parameter');
    }

    if (!source) {
      throw new Error('Export mode requires source database configuration');
    }

    if (!mappingFile) {
      throw new Error('Export mode requires mappingFile parameter');
    }

    const baseDir = path.resolve(exportDir);

    exportOptions.exportDir = path.join(baseDir, time);
    exportOptions.mappingFile = path.resolve(mappingFile);
    exportOptions.dbConfig = source;
    exportOptions.archivePath = compress ? path.join(exportBaseDir, `${time}.zip`) : undefined;
  }

  if (importMode) {
    if (!target) {
      throw new Error('Import mode requires target database configuration');
    }

    importOptions.dbConfig = target;

    if (exportMode && compress) {
      importOptions.importFile = path.join(exportBaseDir, `${time}.zip`);
    } else if (importFile) {
      importOptions.importFile = importFile;
    }

    if (exportMode) {
      importOptions.importDir = exportOptions.exportDir;
    } else if (importDir) {
      importOptions.importDir = importDir;
    } else {
      throw new Error('Import mode requires importDir parameter if not in Export mode');
    }
  }

  return {
    exportOptions,
    importOptions,
    logLevel,
  };
}

getParameters();
const options = validateParameters();
app.run(options);
