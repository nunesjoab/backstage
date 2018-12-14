module.exports = {
  kafka: {
    producer: {
      'metadata.broker.list': '172.20.0.13:9092',
      'compression.codec': 'gzip',
      'retry.backoff.ms': 200,
      'message.send.max.retries': 10,
      'socket.keepalive.enable': true,
      'queue.buffering.max.messages': 100000,
      'queue.buffering.max.ms': 1000,
      'batch.num.messages': 1000000,
      dr_cb: true,
    },

    consumer: {
      'group.id': 'data-broker',
      'metadata.broker.list': '172.20.0.13:9092',
    },
  },
  databroker: {
    host: 'http://172.20.0.16:80',
  },
  auth: {
    host: 'http://172.20.0.19:5000',
  },
  deviceManager: {
    host: 'http://172.20.0.18:5000',
  },
  dojot: {
    managementService: 'internal',
    subjects: {
      tenancy: 'dojot.tenancy',
      devices: 'dojot.device-manager.template',
      deviceData: 'device-data',
    },
  },
};

/*
export KAFKA_HOSTS=172.20.0.12:9092
export DATA_BROKER_URL=http://172.20.0.7
export AUTH_URL=http://172.20.0.5:5000
export DEVICE_MANAGER_URL=http://172.20.0.6:5000

*/
