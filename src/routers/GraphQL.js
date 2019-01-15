const {Router}  = require('express');

const expressGraphQL = require('express-graphql');
const schemaLoginPermission = require('../graphql/schema/Schema');

const router = Router();

router.use('/auth/graphql', expressGraphQL({
  schema: schemaLoginPermission,
  graphiql: true,
}));

/*export default router;*/
module.exports = router;
