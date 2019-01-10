import {GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLList} from 'graphql';
import axios from 'axios';
import {PermissionType, PermissionUtils} from './permissions';
import {baseUrl} from '../GraphQLConfig';

/**
 *
 * @type {GraphQLObjectType}
 */
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    username: {type: GraphQLString},
    email: {type: GraphQLString},
    id: {type: GraphQLString},
    profile: {type: GraphQLString},
    permissions: {
      type: new GraphQLList(PermissionType),
      resolve(parentValue) {
        if (parentValue.profile !== 'admin') {
          const options = {
            method: 'GET',
            headers: {'content-type': 'application/json', 'Authorization': `Bearer ${parentValue.jwt}`},
            url: `${baseUrl}/auth/pap/group/${parentValue.profile}/permissions`,
          };
          return axios(options).then(res => {
            return PermissionUtils.parsePermissions(res);
          })
        } else {
          return PermissionUtils.parsePermissionsAdmin();
        }

      }
    }
  })
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
        const options = {
          method: 'GET',
          headers: {'content-type': 'application/json', 'Authorization': `Bearer ${parentValue.jwt}`},
          url: `${baseUrl}/auth/user/${parentValue.username}`,
        };
        return axios(options).then(res => res.data.user)
      }
    }
  })
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
      resolve(parentValue, args) {

      }
    }
  }
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
      args: {username: {type: GraphQLString}, passwd: {type: GraphQLString}},
      resolve(parentValue, {username, passwd}) {
        return axios.post(`${baseUrl}/auth`, {username, passwd})
          .then(resp => {
            return {jwt: resp.data.jwt, username}
          });
      }
    }
  }
});

module.exports = new GraphQLSchema({
  mutation,
  query: RootQuery
});
