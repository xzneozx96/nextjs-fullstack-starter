import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// The migration is automatically applied during the next database interaction,
// so there's no need to run it manually or restart the Next.js server.

export const userRoles = ['admin', 'student', 'teacher'] as const;
export type UserRole = (typeof userRoles)[number];
export const userRoleEnum = pgEnum('user_roles', userRoles);

export const userTable = pgTable('user', {
  id: uuid().primaryKey().defaultRandom(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  salt: text('salt').notNull(),
  role: userRoleEnum().notNull().default('student'),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
