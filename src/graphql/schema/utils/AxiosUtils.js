const config = require('../../../config');

class AxiosUtils {
  static get GET() {
    return 'GET';
  }

  static get POST() {
    return 'POST';
  }

  static get DELETE() {
    return 'DELETE';
  }

  static optionsAxios(method, url, token) {
    return {
      method,
      headers: { 'content-type': 'application/json', Authorization: `${token}` },
      url: `${config.base_url_graphql}${url}`,
    };
  }
}

module.exports = AxiosUtils;
