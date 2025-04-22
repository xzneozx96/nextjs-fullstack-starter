import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './src/core/drizzle/migrations',
  schema: './src/core/drizzle/models/Schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  verbose: true,
  strict: true,
});
