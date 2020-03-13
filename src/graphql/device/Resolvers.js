const axios = require('axios');
const UTIL = require('../utils/AxiosUtils');
const LOG = require('../../utils/Log');

const params = {
  token: null,
};
const setToken = ((token) => {
  params.token = token;
});
const optionsAxios = ((method, url) => UTIL.optionsAxios(method, url, params.token));

const Resolvers = {
  Query: {
    /**
     * Get one template by id
     * @param root
     * @param id
     * @param context
     * @returns {Promise<*>}
     */
    async getDeviceById(root, { deviceId }, context) {
      setToken(context.token);

      const device = {};

      try {
        const { data: deviceData } = await axios(optionsAxios(UTIL.GET, `/device/${deviceId}`));
        // console.log('data', deviceData);
        device.id = deviceData.id;
        device.label = deviceData.label;
        device.attrs = [];
        Object.keys(deviceData.attrs).forEach((key) => {
          for (let i = 0; i < deviceData.attrs[key].length; i += 1) {
            let valueType = '';

            switch (deviceData.attrs[key][i].value_type) {
              case 'integer':
                valueType = 'NUMBER';
                break;
              case 'float':
                valueType = 'NUMBER';
                break;
              case 'bool':
                valueType = 'BOOLEAN';
                break;
              case 'string':
                valueType = 'STRING';
                break;
              case 'geo:point':
                valueType = 'GEO';
                break;
              default:
                valueType = 'UNDEFINED';
            }

            device.attrs.push({
              label: deviceData.attrs[key][i].label,
              type: valueType,
            });
          }
        });

        return (device);
      } catch (err) {
        console.log('erro', err);
        return (err);
      }
    },
  },
};

module.exports = Resolvers;


/*
  data {
    attrs: {
      '1': [
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object]
      ]
    },
  created: '2020-03-11T16:41:47.668051+00:00',
  id: 'cc6eb1',
  label: 'device1',
  templates: [ 1 ]
  }
  */
