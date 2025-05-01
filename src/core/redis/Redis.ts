import { Env } from '@/core/config/Env';
import { Redis } from '@upstash/redis';

export const redisClient = new Redis({
  url: Env.REDIS_URL,
  token: Env.REDIS_TOKEN,
});
