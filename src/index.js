import express from 'express';
import config from './config';
import templates from './routers/Templates';
import authParse from './utils/auth';

const app = express();
app.use(authParse.authParse);
app.use(templates);

app.listen(config.port, () => {
  console.log(`server running on port ${config.port}`);
});
