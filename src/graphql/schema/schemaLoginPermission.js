const {
	GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLInt
} = require('graphql');
const axios = require('axios');
const {GraphQLInputObjectType} = require('graphql/type/definition');
const _ = require('lodash');
const PermissionsHelper = require('./helpers/PermissionsHelper');
const mapPermissionsJson = require('./utils/MapPermissions');
const UTIL = require('./utils/GraphQLUtils');
const {baseUrl} = require('../GraphQLConfig');

const params = {
	jwt: null,
	permissionsGroupOld: [],
	permissionsSystem: [],
};
const optionsAxios = ((method, url) =>
		UTIL.optionsAxios(method, url, params.jwt)
);
const setJWT = ((context) =>
		params.jwt = UTIL.setJWT(context)
);

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
					return axios(optionsAxios(UTIL.GET, `/auth/pap/group/${parentValue.profile}/permissions`)).then(res => PermissionsHelper.parsePermissionsCaslLogin(res));
				}
				return PermissionsHelper.parsePermissionsAdminCaslLogin();
			},
		},
	}),
});

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

async function initPermissions(groupName) {
	try {
		const prom1 = axios(optionsAxios(UTIL.GET, '/auth/pap/permission?type=system')).then((res) => {
			params.permissionsSystem = res.data.permissions;
		});
		const prom2 = axios(optionsAxios(UTIL.GET, `/auth/pap/group/${groupName}/permissions`)).then((res) => {
			params.permissionsGroupOld = res.data.permissions;
		});
		await Promise.all([prom1, prom2]);
	} catch (e) {
		console.log(e);
	}
}

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
	return axios(optionsAxios(permNew ? UTIL.POST : UTIL.DELETE, `/auth/pap/grouppermissions/${groupName}/${permId}`)).then((res) => {
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

const mutation = new GraphQLObjectType({
	name: 'Mutation',
	fields: {
		login: {
			type: LoginType,
			args: {username: {type: GraphQLString}, passwd: {type: GraphQLString}},
			resolve(parentValue, {username, passwd}) {
				return axios.post(`${baseUrl}/auth`, {username, passwd})
					.then((resp) => {
						const user = UTIL.getUserFromJwt(resp.data.jwt);
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
				setJWT(context);
				return await initPermissions(groupName).then(async () => {
					let response = [];
					let promises = [];

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
