const {Router} = require('express');
const expressGraphQL = require('express-graphql');
const {schemaLogin, schemaPermission} = require('../graphql/schema/Schema');

const router = Router();

router.use('/graphql/auth/', expressGraphQL({
	schema: schemaLogin,
	graphiql: false,
}));

router.use('/graphql/permissions', expressGraphQL({
	schema: schemaPermission,
	graphiql: true,
}));

module.exports = router;
