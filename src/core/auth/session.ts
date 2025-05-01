import type { Cookies, UserSession } from './types';
import { redisClient } from '../redis/Redis';
import { COOKIE_SESSION_KEY, REDIS_KEY_SESSION_PREFIX, SESSION_EXPIRATION_SECONDS } from './constant';
import { sessionSchema } from './types';

export function getUserFromSession(cookies: Pick<Cookies, 'get'>) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (sessionId == null) {
    return null;
  }

  return getUserSessionById(sessionId);
}

export async function createUserSession(
  user: UserSession,
  cookies: Pick<Cookies, 'set'>,
) {
  const sessionId = crypto.randomUUID();
  await redisClient.set(`${REDIS_KEY_SESSION_PREFIX}${sessionId}`, sessionSchema.parse(user), {
    ex: SESSION_EXPIRATION_SECONDS,
  });

  setCookie(sessionId, cookies);
}

export async function updateUserSessionData(
  user: UserSession,
  cookies: Pick<Cookies, 'get'>,
) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (!sessionId) {
    return;
  }

  await redisClient.set(`${REDIS_KEY_SESSION_PREFIX}${sessionId}`, sessionSchema.parse(user), {
    ex: SESSION_EXPIRATION_SECONDS,
  });
}

export async function removeUserFromSession(
  cookies: Pick<Cookies, 'get' | 'delete'>,
) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (!sessionId) {
    return;
  }

  await redisClient.del(`${REDIS_KEY_SESSION_PREFIX}${sessionId}`);
  cookies.delete(COOKIE_SESSION_KEY);
}

function setCookie(sessionId: string, cookies: Pick<Cookies, 'set'>) {
  cookies.set(COOKIE_SESSION_KEY, sessionId, {
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    expires: Date.now() + SESSION_EXPIRATION_SECONDS * 1000,
  });
}

async function getUserSessionById(sessionId: string) {
  const rawUser = await redisClient.get(`${REDIS_KEY_SESSION_PREFIX}${sessionId}`);

  const { success, data: user } = sessionSchema.safeParse(rawUser);

  return success ? user : null;
}
