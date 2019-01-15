const {b64decode} = require('../../../utils/auth');
const {baseUrl} = require('../../GraphQLConfig');

class GraphQLUtils {

	static get GET() {
		return 'GET';
	}

	static get POST() {
		return 'POST';
	}

	static get DELETE() {
		return 'DELETE';
	}

	static getUserFromJwt(jwt) {
		return JSON.parse(b64decode(jwt.split('.')[1]));
	}

	static setJWT(context) {
		return context.header('authorization') ? context.header('authorization').replace('Bearer ', '') : '';
	}

	static optionsAxios(method, url, jwt) {
		return {
			'method': method,
			headers: {'content-type': 'application/json', Authorization: `Bearer ${jwt}`},
			url: `${baseUrl}${url}`,
		};
	}
}

module.exports = GraphQLUtils;
