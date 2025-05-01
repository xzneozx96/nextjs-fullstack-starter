'use server';

import type { ServerActionResponse } from '@/shared/types/global';
import type { z } from 'zod';
import { comparePasswords, generateSalt, hashPassword } from '@/core/auth/passwordHasher';
import { createUserSession, removeUserFromSession } from '@/core/auth/session';
import { db } from '@/core/drizzle/DB';
import { userTable } from '@/core/drizzle/models/Schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { signInSchema, signUpSchema } from './auth-actions.validation';

type SignUpResponse = ServerActionResponse<string> & {
  message?: string;
};

export async function signUp(unsafeData: z.infer<typeof signUpSchema>): Promise<SignUpResponse> {
  const { success, data } = signUpSchema.safeParse(unsafeData);

  if (!success) {
    return {
      success: false,
      error: 'Some required fields are missing. Please try again',
    };
  }

  const existingUser = await db.query.userTable.findFirst({
    where: eq(userTable.email, data.email),
  });

  if (existingUser != null) {
    return {
      success: false,
      error: 'Email already in use. Try logging in or resetting your password',
    };
  }

  const salt = generateSalt();
  const hashedPassword = await hashPassword(data.password, salt);

  const [user] = await db
    .insert(userTable)
    .values({
      username: data.username,
      email: data.email,
      password: hashedPassword,
      salt,
    })
    .returning();

  if (user == null) {
    return {
      success: false,
      error: 'Unable to create new account',
    };
  }

  await createUserSession({ id: user.id, role: user.role }, await cookies());

  redirect('/mock-test');
}

export async function logIn(unsafeData: z.infer<typeof signInSchema>): Promise<ServerActionResponse<string>> {
  const { success, data } = signInSchema.safeParse(unsafeData);

  if (!success) {
    return {
      success: false,
      error: 'Invalid credentials. Please try again',
    };
  }

  const user = await db.query.userTable.findFirst({
    columns: { password: true, salt: true, id: true, email: true, role: true },
    where: eq(userTable.email, data.email),
  });

  if (!user || !user.password || !user.salt) {
    return {
      success: false,
      error: 'Email or password is incorrect.',
    };
  }

  const isCorrectPassword = await comparePasswords({
    hashedPassword: user.password,
    password: data.password,
    salt: user.salt,
  });

  if (!isCorrectPassword) {
    return {
      success: false,
      error: 'Username or password is incorrect. Please try again.',
    };
  }

  await createUserSession(user, await cookies());

  redirect('/mock-test');
}

export async function logOut() {
  await removeUserFromSession(await cookies());
  redirect('/');
}
