import {Router} from 'express';

const expressGraphQL = require('express-graphql');
const schema = require('../graphql/schema/schema');

const router = Router();

router.use('/auth/graphql', expressGraphQL({
  schema,
  graphiql: true,
}));

export default router;
