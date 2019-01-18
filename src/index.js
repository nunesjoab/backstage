const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const templates = require('./routers/Templates');
const graphQL = require('./routers/GraphQL');
const authParse = require('./utils/auth');

const app = express();

app.use(bodyParser.json());
app.use(authParse.authParse);
app.use(templates);
app.use(graphQL);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
