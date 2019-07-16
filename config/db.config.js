module.exports = {
  development: {
    username: process.env.RAMBLER_USER,
    password: process.env.RAMBLER_PASSWORD,
    database: 'mock_development',
    host: process.env.RAMBLER_HOST,
    logging: process.env.PG_LOGGING_ENABLED || false,
    pool: {
      max: process.env.PG_MAX_POOL_SIZE || 10
    },
    dialect: 'postgres'
  },
  test: {
    username: process.env.RAMBLER_USER,
    password: process.env.RAMBLER_PASSWORD,
    database: 'mock_test',
    host: process.env.RAMBLER_HOST,
    logging: process.env.PG_LOGGING_ENABLED || false,
    pool: {
      max: process.env.PG_MAX_POOL_SIZE || 10
    },
    dialect: 'postgres'
  },
  production: {
    username: process.env.RAMBLER_USER,
    password: process.env.RAMBLER_PASSWORD,
    database: process.env.RAMBLER_DATABASE,
    host: process.env.RAMBLER_HOST,
    port: 5432,
    dialect: 'postgres',
    logging: process.env.PG_LOGGING_ENABLED || false,
    pool: {
      max: process.env.PG_MAX_POOL_SIZE || 15
    },
    dialectOptions: {
      // ssl: true
    }
  }
}
