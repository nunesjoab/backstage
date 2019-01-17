const { baseUrl } = require('../../GraphQLConfig');

class Utils {
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
      url: `${baseUrl}${url}`,
    };
  }
}

module.exports = Utils;
