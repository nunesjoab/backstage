import {Router} from 'express';

const expressGraphQL = require('express-graphql');
const schemaLoginPermission = require('../graphql/schema/schemaLoginPermission');

const router = Router();

router.use('/auth/graphql', expressGraphQL({
  schema: schemaLoginPermission,
  graphiql: true,
}));
router.use('/auth/graphql/permissions', expressGraphQL({
  schema: schemaLoginPermission,
  graphiql: true,
}));

export default router;
