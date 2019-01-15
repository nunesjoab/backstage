const _ = require('lodash');
const mapPermissionsJson = require('../utils/MapPermissions');

class PermissionsHelper {
	/**
	 *
	 * @param res
	 * @returns {Array}
	 */
	static parsePermissionsCaslLogin(res) {
		const caslArrayPermissions = [];
		const permissionsGroupByPath = _.groupBy(res.data.permissions, 'path');
		Object.keys(permissionsGroupByPath).forEach((key) => {
			if (mapPermissionsJson[key]) {
				caslArrayPermissions.push({
					actions: permissionsGroupByPath[key].map(y => mapPermissionsJson[y.path][y.method].method),
					subject: mapPermissionsJson[key].action,
				});
			}
		});
		return caslArrayPermissions;
	}

	static getPermissionId(path, method, arrPermissions) {
		const permissionsSystemByPath = _.groupBy(arrPermissions, 'path');
		return permissionsSystemByPath[path].find(g => g.method === method && g.permission === 'permit').id;
	}

	/**
	 *
	 * @returns {Array}
	 */
	static parsePermissionsAdminCaslLogin() {
		// if group is admin, create all permissions
		const caslArrayPermissions = [];
		Object.keys(mapPermissionsJson).forEach((key) => {
			caslArrayPermissions.push({
				actions: ['viewer', 'modifier'],
				subject: mapPermissionsJson[key].action,
			});
		});
		return caslArrayPermissions;
	}
}

module.exports = PermissionsHelper;
