const dojot = require('@dojot/dojot-module');

const messenger = new dojot.Messenger('sample');

module.exports = messenger.init().then(() => {
  messenger.createChannel('device-data', 'rw');
  messenger.createChannel('dojot.tenancy', 'r', true);
  messenger.createChannel('iotagent-info', 'rw', true);
  messenger.on('dojot.device-manager.template', 'message', (tenant, msg) => {
    console.log(`Client: Message is: ${msg}`);
  });
});
