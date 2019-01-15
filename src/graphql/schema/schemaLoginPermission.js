const {
	GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLInt
} = require('graphql');
const axios = require('axios');
const {GraphQLInputObjectType} = require('graphql/type/definition');
const _ = require('lodash');
const PermissionsHelper = require('./helpers/permissions');
const {baseUrl} = require('../GraphQLConfig');
const {b64decode} = require('../../utils/auth');
const mapPermissionsJson = require('./utils/MapPermissions');

const params = {
	jwt: null,
	permissionsGroupOld: [],
	permissionsSystem: [],
};
const REQ_HEADER = {'content-type': 'application/json', Authorization: `Bearer ${params.jwt}`};

function getUserFromJwt(jwt) {
	return JSON.parse(b64decode(jwt.split('.')[1]));
}

function jwt(context) {
	params.jwt = context.header('authorization') ? context.header('authorization').replace('Bearer ', '') : '';
	/*console.log('params.jwt context', params.jwt);*/
}

function getPermissionId(path, method, arrPermissions) {
	const permissionsSystemByPath = _.groupBy(arrPermissions, 'path');
	return permissionsSystemByPath[path].find(g => g.method === method && g.permission === 'permit').id;
}


const PermissionTypeOutput = new GraphQLObjectType({
	name: 'PermissionOut',
	fields: {
		subject: {type: GraphQLString},
		actions: {type: new GraphQLList(GraphQLString)},
	},
});
const PermissionTypeInput = new GraphQLInputObjectType({
	name: 'PermissionIn',
	fields: {
		subject: {type: GraphQLString},
		actions: {type: new GraphQLList(GraphQLString)},
	},
});

/**
 *
 * @type {GraphQLObjectType}
 */
const UserType = new GraphQLObjectType({
	name: 'User',
	fields: () => ({
		username: {type: GraphQLString},
		id: {type: GraphQLString},
		profile: {type: GraphQLString},
		permissions: {
			type: new GraphQLList(PermissionTypeOutput),
			resolve(parentValue) {
				if (parentValue.profile !== 'admin') {
					const options = {
						method: 'GET',
						headers: REQ_HEADER,
						url: `${baseUrl}/auth/pap/group/${parentValue.profile}/permissions`,
					};
					return axios(options).then(res => PermissionsHelper.parsePermissionsCaslLogin(res));
				}
				return PermissionsHelper.parsePermissionsAdminCaslLogin();
			},
		},
	}),
});

/**
 *
 * @type {GraphQLObjectType}
 */
const LoginType = new GraphQLObjectType({
	name: 'Login',
	fields: () => ({
		jwt: {type: GraphQLString},
		user: {
			type: UserType,
			resolve(parentValue) {
				return {
					username: parentValue.user.username,
					id: parentValue.user.userid,
					profile: parentValue.user.profile,
				};
			},
		},
	}),
});

/**
 *
 * @type {GraphQLObjectType}
 */
const RootQuery = new GraphQLObjectType({
	name: 'RootQueryType',
	fields: {
		user: {
			type: LoginType,
			args: {id: {type: GraphQLString}},
			resolve() {
			},
		},
	},
});

const method = {
	GET: 'GET',
	POST: 'POST',
	DELETE: 'DELETE',
};


async function initPermissions(groupName) {
	try {
		const prom1 = axios(optionsAxios(method.GET, '/auth/pap/permission?type=system')).then((res) => {
			params.permissionsSystem = res.data.permissions;
		});
		const prom2 = axios(optionsAxios(method.GET, `/auth/pap/group/${groupName}/permissions`)).then((res) => {
			params.permissionsGroupOld = res.data.permissions;
		});
		await Promise.all([prom1, prom2]);
	} catch (e) {
		console.log(e);
	}
}


function optionsAxios(method, path) {
	const REQ_HEADER2 = {'content-type': 'application/json', Authorization: `Bearer ${params.jwt}`};
	return {
		'method': method,
		headers: REQ_HEADER2,
		url: `${baseUrl}${path}`,
	};
}

/*message: 'ok', status: 200*/

const ResponseOutput = new GraphQLObjectType({
	name: 'ResponseOutput',
	fields: {
		message: {type: GraphQLString},
		status: {type: GraphQLInt},
		subject: {type: GraphQLString},
		action: {type: GraphQLString},
	},
});


function updatePermAssociation(permNew, permId, groupName, subjectAlias, actionAlias, response) {
	return axios(optionsAxios(permNew ? method.POST : method.DELETE, `/auth/pap/grouppermissions/${groupName}/${permId}`)).then((res) => {
		response.push({
			message: res.data.message,
			status: res.data.status,
			subject: subjectAlias,
			action: actionAlias,
		});
	}).catch(e => {
		console.log(e);
	});
}

/**
 *
 * @type {GraphQLObjectType}
 */
const mutation = new GraphQLObjectType({
	name: 'Mutation',
	fields: {
		login: {
			type: LoginType,
			args: {username: {type: GraphQLString}, passwd: {type: GraphQLString}},
			resolve(parentValue, {username, passwd}) {
				return axios.post(`${baseUrl}/auth`, {username, passwd})
					.then((resp) => {
						const user = getUserFromJwt(resp.data.jwt);
						params.jwt = resp.data.jwt;
						return {jwt: resp.data.jwt, user};
					});
			},
		},
		permissions: {
			type: new GraphQLList(ResponseOutput),
			args: {
				permissions: {
					type: new GraphQLList(PermissionTypeInput),
				},
				groupName: {type: GraphQLString},
			},
			resolve: async (parentValue, {permissions, groupName}, context) => {
				jwt(context);
				let response = [];
				let promises = [];
				return await initPermissions(groupName).then(async () => {

					const permissionsGroupOld = _.groupBy(params.permissionsGroupOld, 'path');

					params.permissionsSystem.forEach((item) => {
						if (mapPermissionsJson[item.path]) {

							const subjectAlias = mapPermissionsJson[item.path].action;
							const actionAlias = mapPermissionsJson[item.path][item.method].method;

							const permOld = _.find(permissionsGroupOld[item.path], g => g.method === item.method && g.permission === 'permit');
							const permNew = _.find(permissions, g => g.subject === subjectAlias && _.find(g.actions, h => h === actionAlias));
							if (permOld && permNew) {
								return
							}
							if (permOld || permNew) {
								const permId = item.id;
								promises.push(updatePermAssociation(permNew, permId, groupName, subjectAlias, actionAlias, response));
							}
						}
					});
					await Promise.all(promises);
					return response;
				});
			},
		},
	},
});

module.exports = new GraphQLSchema({
	mutation,
	query: RootQuery,
});
