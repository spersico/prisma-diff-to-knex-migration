// Knex configuration object

import dotenv from 'dotenv';
dotenv.config();

const config = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  migrations: {
    extension: 'mjs',
    loadExtensions: ['.mjs'],
  },
};

export default config;
