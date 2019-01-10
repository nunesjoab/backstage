const _ = require('lodash');
const mapPermissionsJson = require('./utils/MapPermissions');
//const graphql = require('graphql');

import {GraphQLObjectType, GraphQLString, GraphQLList} from 'graphql';

export class PermissionUtils {
  /**
   *
   * @param res
   * @returns {Array}
   */
  static parsePermissions(res) {
    const caslArrayPermissions = [];
    const permissionsGroupByPath = _.groupBy(res.data.permissions, "path");
    Object.keys(permissionsGroupByPath).forEach((key) => {
      caslArrayPermissions.push({
        "actions": permissionsGroupByPath[key].map(y => mapPermissionsJson[y.path][y.method].method),
        "subject": mapPermissionsJson[key].action
      });
    });
    return caslArrayPermissions;
  }

  /**
   *
   * @returns {Array}
   */
  static parsePermissionsAdmin() {
//if group is admin, create all permissions
    const caslArrayPermissions = [];
    Object.keys(mapPermissionsJson).forEach((key) => {
      caslArrayPermissions.push({
        "actions": ["viewer", "modifier"],
        "subject": mapPermissionsJson[key].action
      });
    });
    return caslArrayPermissions;
  }

}

/**
 *
 * @type {GraphQLObjectType}
 */
export const PermissionType = new GraphQLObjectType({
  name: 'Permission',
  fields: {
    subject: {type: GraphQLString},
    actions: {type: new GraphQLList(GraphQLString)}
  }
});

