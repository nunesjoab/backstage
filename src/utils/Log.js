const log4js = require('log4js');

log4js.configure({
  appenders: { out: { type: 'stdout', layout: { type: 'basic' } } },
  categories: { default: { appenders: ['out'], level: 'info' } },
});
const Log = log4js.getLogger('BackStage');

module.exports = Log;
