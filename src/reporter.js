
const clui = require('clui');
const clc = require('cli-color');
const _ = require('lodash');
const Line = clui.Line;
// require('../lib/clui.js'),
//       clc = require('cli-color');

module.exports = (() => {
  const stats = {};

  const update = ({ thread, task, subtask, rows, elapsed }) => {

    const key = task.split('-').slice(1, 3).join('-');
    if(!stats.hasOwnProperty(key)) {
      stats[key] = {
        display: key,
        getElapsed: 0,
        getRows: 0,
        insertedElapsed: 0,
        insertedRows: 0,
        syncElapsed: 0,
        status: '',
      };
    }

    const s = stats[key];

    switch(subtask) {
      case 'getData':
        s.getElapsed += elapsed;
        s.getRows += rows;
        break;
      case 'transferStarted':
        s.status = 'transferring';
        break;
      case 'transferComplete':
        s.status = 'transferred';
        break;
      case 'syncStarted':
        s.status = 'syncing';
        break;
      case 'syncComplete':
        s.status = 'complete';
        s.syncElapsed = elapsed;
        break;
      case 'inserted':
        s.insertedRows += rows;
        s.insertedElapsed += elapsed;
        break;
    }


    // draw();
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'transferring':
      case 'transferred':
      case 'syncing':
        return clc.blue;
      case 'complete':
        return clc.green;
      default:
        return clc.white;
    }
  }

  const draw = () => {
    //process.stdout.write('\x1b[9A');
    // const blankLine = new Line().fill().output();

    const buffer = new clui.LineBuffer({x: 0, y: 0, width: 'console', height: 'console', scroll: 0});

    const header = new Line()
      .padding(2)
      .column('Task', 25, [clc.cyan])
      .column('Status', 16, [clc.cyan])
      .column('Retrieve Rows', 17, [clc.cyan])
      .column('Inserted Rows', 17, [clc.cyan])
      .column('Retrieve', 17, [clc.cyan])
      .column('Insert', 17, [clc.cyan])
      .column('Sync', 17, [clc.cyan])
      .column('Total', 17, [clc.cyan])
      .fill();
    buffer.addLine(header);
      // .output();

    _.each(stats, (s) => {

      const getColor = getStatusColor(s.status);
      const line = new Line()
        .padding(2)
        .column(s.display + '', 25)
        .column(s.status + '', 16, [getColor])
        .column(s.getRows + '', 17)
        .column(s.insertedRows + '', 17)
        .column((s.getElapsed / 1000).toFixed(1) + ' sec', 17)
        .column((s.insertedElapsed / 1000).toFixed(1) + ' sec', 17)
        .column((s.syncElapsed / 1000).toFixed(1) + ' sec', 17)
        .column(((s.getElapsed + s.insertedElapsed + s.syncElapsed ) / 1000).toFixed(1) + ' sec', 17);
        // .fill()
        // .output();
      buffer.addLine(line);
    })

    process.stdout.write('\033c');
    buffer.output();
  };

  const start = () => {
    setInterval(draw, 1000);
  }

  return {
    start,
    draw,
    update,
  };
})();
