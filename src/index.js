import express from 'express';
import config from './config';
import templates from './routers/Templates';
import graphQL from './routers/GraphQL';
import authParse from './utils/auth';
const bodyParser = require('body-parser');


const app = express();

app.use(bodyParser.json());
app.use(authParse.authParse);
app.use(templates);
app.use(graphQL);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

