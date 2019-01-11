import {
  GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLList,
} from 'graphql';
import axios from 'axios';
import PermissionsHelper from './helpers/permissions';
import { baseUrl } from '../GraphQLConfig';
import { b64decode } from '../../utils/auth';

const params = {
  jwt: null,
};
const REQ_HEADER = { 'content-type': 'application/json', Authorization: `Bearer ${params.jwt}` };

/**
 *
 * @type {GraphQLObjectType}
 *
 */
const PermissionType = new GraphQLObjectType({
  name: 'Permission',
  fields: {
    subject: { type: GraphQLString },
    actions: { type: new GraphQLList(GraphQLString) },
  },
});

/**
 *
 * @type {GraphQLObjectType}
 */
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    username: { type: GraphQLString },
    id: { type: GraphQLString },
    profile: { type: GraphQLString },
    permissions: {
      type: new GraphQLList(PermissionType),
      resolve(parentValue) {
        if (parentValue.profile !== 'admin') {
          const options = {
            method: 'GET',
            headers: REQ_HEADER,
            url: `${baseUrl}/auth/pap/group/${parentValue.profile}/permissions`,
          };
          return axios(options).then(res => PermissionsHelper.parsePermissions(res));
        }
        return PermissionsHelper.parsePermissionsAdmin();
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
    jwt: { type: GraphQLString },
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
      args: { id: { type: GraphQLString } },
      resolve() {
      },
    },
  },
});

/**
 *
 * @type {GraphQLObjectType}
 */
const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    login: {
      type: LoginType,
      args: { username: { type: GraphQLString }, passwd: { type: GraphQLString } },
      resolve(parentValue, { username, passwd }) {
        return axios.post(`${baseUrl}/auth`, { username, passwd })
          .then((resp) => {
            const user = JSON.parse(b64decode(resp.data.jwt.split('.')[1]));
            params.jwt = resp.data.jwt;
            return { jwt: resp.data.jwt, user };
          });
      },
    },
  },
});

module.exports = new GraphQLSchema({
  mutation,
  query: RootQuery,
});
