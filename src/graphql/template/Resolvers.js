const axios = require('axios');
const UTIL = require('../utils/AxiosUtils');

const params = {
  token: null,
};
const setToken = (token => (params.token = token));
const optionsAxios = ((method, url) => UTIL.optionsAxios(method, url, params.token));

const reservedLabelImg = ['desired_version', 'version', 'update', 'update_result', 'state'];
const hasReservedLabelImg = ((attr) => {
  if (attr.metadata && attr.metadata.length > 0) {
    if (attr.metadata.find(meta => reservedLabelImg.includes(meta.label))) {
      return true;
    }
  }
  return false;
});

const Resolvers = {
  Query: {
    async template(root, { id }, context) {
      setToken(context.token);
      setToken('Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnZW82dVYyamQ4TmtwQ1M4a2lZUkZmSVJqS1N6Rm5MaSIsImlhdCI6MTU1MDA1ODIyMiwiZXhwIjoxNTUwMDU4NjQyLCJwcm9maWxlIjoiYWRtaW4iLCJncm91cHMiOlsxXSwidXNlcmlkIjoxLCJqdGkiOiI5YTY2MGU1N2ExNTkwNDliY2RmMzMwYjlmYmQyMjgyNiIsInNlcnZpY2UiOiJhZG1pbiIsInVzZXJuYW1lIjoiYWRtaW4ifQ.WbIVkp72R2-iQOvnLKKdyyXVi8qJJGHutB1_ZFmcY0s');
      const { data: templateData } = await axios(optionsAxios(UTIL.GET, `/template/${id}`));
      const attrImg = [];
      if (templateData) {
        let { attrs, config_attrs: configAttrs, data_attrs: dataAttrs } = templateData;
        if (attrs) {
          attrs = attrs.filter((attr) => {
            if (hasReservedLabelImg(attr)) {
              attrImg.push(attr);
              return false;
            }
            return true;
          });
        }
        if (configAttrs) {
          configAttrs = configAttrs.filter(attr => !hasReservedLabelImg(attr));
        }

        if (dataAttrs) {
          dataAttrs = dataAttrs.filter(attr => !hasReservedLabelImg(attr));
        }

        attrs.map((attr) => {
          if (!attr.metadata) attr.metadata = [];
          return attr;
        });

        return {
          ...templateData,
          img_attrs: attrImg,
          config_attrs: configAttrs,
          data_attrs: dataAttrs,
          attrs,
        };
      }
      return {};
    },
    async templatesHasImageFirmware(root, { templatesId }, context) {
      setToken(context.token);
      setToken('Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnZW82dVYyamQ4TmtwQ1M4a2lZUkZmSVJqS1N6Rm5MaSIsImlhdCI6MTU1MDA1ODIyMiwiZXhwIjoxNTUwMDU4NjQyLCJwcm9maWxlIjoiYWRtaW4iLCJncm91cHMiOlsxXSwidXNlcmlkIjoxLCJqdGkiOiI5YTY2MGU1N2ExNTkwNDliY2RmMzMwYjlmYmQyMjgyNiIsInNlcnZpY2UiOiJhZG1pbiIsInVzZXJuYW1lIjoiYWRtaW4ifQ.WbIVkp72R2-iQOvnLKKdyyXVi8qJJGHutB1_ZFmcY0s');
      const map = [];
      const promises = [];
      templatesId.forEach((id) => {
        const promise = axios(optionsAxios(UTIL.GET, `/template/${id}`)).then((res) => {
          const { data } = res;
          const { attrs } = data;
          if (attrs) {
            let hasImageFirmware = false;
            attrs.forEach((attr) => {
              if (hasReservedLabelImg(attr)) {
                hasImageFirmware = true;
              }
            });
            map.push({ key: `${id}`, value: `${hasImageFirmware}` });
          }
        }).catch((e) => {
          console.log(e);
        });
        promises.push(promise);
      });

      Promise.all(promises).then((p) => {
        console.log(p);
        return map;
      });
    },
  },
};

module.exports = Resolvers;
