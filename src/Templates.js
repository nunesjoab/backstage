const axios = require('axios');
const dojot = require('@dojot/dojot-module');
const config = require('./config');

const dataReturn = [];

const fill = (data) => {
  data.templates.forEach((item) => {
    dataReturn.push(item);
  });
};

const checkConfits = (templates) => {
  const data = {};
  templates.forEach((template) => {
    template.attrs.forEach((attr) => {
      templates.forEach((templateAux) => {
        if (templateAux.id !== template.id) {
          templateAux.attrs.forEach((attrAux) => {
            if (attrAux.label === attr.label) {
              // eslint-disable-next-line no-unused-expressions
              data[template.id] !== undefined
                ? data[template.id] = data[template.id].concat([templateAux.id])
                : data[template.id] = [templateAux.id];
            }
          });
        }
      });
    });
  });
  return data;
};

const get = () => new Promise((resolve, reject) => {
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
        fill(obj.data);
        if (obj.data.pagination.has_next) {
          request(`${config.deviceManager.host}/template?page_num=${obj.pagination.next_page}`);
        } else {
          resolve(dataReturn);
        }
      })
      .catch((err) => {
        reject(err);
      });
  };

  request(`${config.deviceManager.host}/template`);
});

module.exports = { get, fill, checkConfits };
