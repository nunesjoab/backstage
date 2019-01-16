const {
	GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLInt, GraphQLInputObjectType
} = require('graphql');
const axios = require('axios');
/*const {GraphQLInputObjectType} = require('graphql/type/definition');*/
const _ = require('lodash');
const PermissionsHelper = require('./helpers/PermissionsHelper');
const UTIL = require('./utils/Utils');
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
const ADMIN_GROUP_NAME = 'admin';

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
			resolve: async (parentValue) => {
				if (parentValue.profile !== ADMIN_GROUP_NAME) {
					return await axios(optionsAxios(UTIL.GET, `/auth/pap/group/${parentValue.profile}/permissions`)).then(res => PermissionsHelper.parsePermissionsFromAuthBack(res.data.permissions)).catch(e => {
						console.log(e);
					});
				}
				return PermissionsHelper.parsePossiblesPermissionsFromJson();
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
		},
	},
});
const ResponseOutput = new GraphQLObjectType({
	name: 'Response',
	fields: {
		message: {type: GraphQLString},
		status: {type: GraphQLInt},
		subject: {type: GraphQLString},
		action: {type: GraphQLString},
	},
});

function axiosPermissionsSystem() {
	return axios(optionsAxios(UTIL.GET, '/auth/pap/permission?type=system')).then((res) => {
		params.permissionsSystem = res.data.permissions;
	});
}

function axiosPermissionsGroup(groupName) {
	return axios(optionsAxios(UTIL.GET, `/auth/pap/group/${groupName}/permissions`)).then((res) => {
		params.permissionsGroupOld = res.data.permissions;
	});
}

const RootQuery2 = new GraphQLObjectType({
	name: 'RootQueryType2',
	fields: {
		permissions: {
			type: new GraphQLList(PermissionTypeOutput),
			args: {
				groupName: {type: GraphQLString},
			},
			resolve: async (parentValue, {groupName}, context) => {
				setJWT(context);
				if (groupName && groupName !== ADMIN_GROUP_NAME) {
					await axiosPermissionsGroup(groupName);
					return PermissionsHelper.parsePermissionsFromAuthBack(params.permissionsGroupOld);
				} else {
					await axiosPermissionsSystem();
					return PermissionsHelper.parsePermissionsFromAuthBack(params.permissionsSystem);
				}
			}
		},
	},
});


const initPermissions = async (groupName) => {
	try {
		const prom1 = axiosPermissionsSystem();
		const prom2 = axiosPermissionsGroup(groupName);
		await Promise.all([prom1, prom2]);
	} catch (e) {
		console.log(e);
	}
};


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


const mutation2 = new GraphQLObjectType({
	name: 'Mutation',
	fields: {
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
						if (PermissionsHelper.patchExist(item.path)) {
							const subjectAlias = PermissionsHelper.getSubjectAlias(item.path);
							const actionAlias = PermissionsHelper.getActionAlias(item.path, item.method);

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

const mutation1 = new GraphQLObjectType({
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
					}).catch(e => {
						console.log(e);
					});
			},
		}
	},
});

const schemaLogin = new GraphQLSchema({
	mutation: mutation1,
	query: RootQuery,
});

const schemaPermission = new GraphQLSchema({
	mutation: mutation2,
	query: RootQuery2,
});
module.exports = {schemaLogin, schemaPermission};
