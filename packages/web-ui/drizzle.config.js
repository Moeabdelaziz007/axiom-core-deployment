require('dotenv').config({ path: '.env.local' });

/** @type { import("drizzle-kit").Config } */
module.exports = {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
};
