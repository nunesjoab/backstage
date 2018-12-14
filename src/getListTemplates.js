const axios = require('axios');
const dojot = require('@dojot/dojot-module');
const config = require('../src/config');

const get = () => new Promise((resolve, reject) => {
  const dataReturn = {
    templates: [],
  };
  const fill = (data) => {
    if (data.templates > 0) {
      data.templates.forEach((item) => {
        dataReturn.templates.push(item);
      });
    }
  };

  const request = (url) => {
    const token = dojot.Auth.getManagementToken('admin');
    const options = {
      headers: {
        authorization: token,
        'content-type': 'application/json',
      },
    };

    axios(url, options)
      .then((obj) => {
        fill(obj);
        if (obj.data.pagination.has_next) {
          request(`${config.deviceManager.host}/template?page_num=${obj.pagination.next_page}`);
        } else {
          console.log(dataReturn);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  request(`${config.deviceManager.host}/template`);
});

get();
