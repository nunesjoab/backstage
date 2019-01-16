import { Pool } from 'pg';
import config from '../config';

const pool = new Pool({
  user: config.postgres_user,
  host: config.postgres_host,
  database: config.postgres_database,
  password: config.postgres_password,
  port: config.postgres_port,
});

export default pool;
