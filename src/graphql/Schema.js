const { makeExecutableSchema } = require('graphql-tools');
const { merge } = require('lodash');
const commonTypeDefs = require('./common/TypeDefs');
const templateTypeDefs = require('./template/TypeDefs');
const templateResolvers = require('./template/Resolvers');


const query = [`
type Query {
   #Get a template by Id
    template(id: Int!): Template
    #Checks if templates has Image Firmware and return a array with objects key-value, where key is a id template and value is a boolean.
    #The value is true if the template has image firmware.
    templatesHasImageFirmware(templatesId: [Int]!): [MapStringToString]
  }
`];
// Put schema together into one array of schema strings
// and one map of resolvers, like makeExecutableSchema expects
const typeDefs = [...query, ...templateTypeDefs, ...commonTypeDefs];
const resolvers = merge(templateResolvers);

const executableSchema = makeExecutableSchema({ typeDefs, resolvers });

module.exports = executableSchema;
module.exports.typeDefs = typeDefs;
