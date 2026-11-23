require('dotenv').config();

module.exports = {
  development: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    migrations: { directory: './database/migrations' },
    seeds:      { directory: './database/seeds' },
    pool: { min: 2, max: 10 },
  },
  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    migrations: { directory: './database/migrations' },
    seeds:      { directory: './database/seeds' },
    pool: { min: 2, max: 10 },
  },
};
