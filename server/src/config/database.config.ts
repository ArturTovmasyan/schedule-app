const DatabaseConfig = () => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5445,
  database: process.env.DB_NAME || '',
  username: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  synchronize: process.env.DB_SYNCHRONIZE || false,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/db/dev-migrations/**/*.js'],
  subscribers: ['dist/subscriber/**/*.js'],
  migrationsRun: false,
  cli: {
    entitiesDir: 'src',
    migrationsDir: 'src/db/migrations',
  },
});

export default DatabaseConfig;
