const config = {
  port: process.env.PORT || 3005,
  postgres_user: process.env.POSTGRES_USER || 'postgres',
  postgres_host: process.env.POSTGRES_HOST || '172.23.0.9',
  postgres_database: process.env.POSTGRES_DATABASE || 'dojot_devm',
  postgres_password: process.env.POSTGRES_PASSWORD || 'postgres',
  postgres_port: process.env.POSTGRES_PORT || 5432,
};

export default config;
