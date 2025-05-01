import { Env } from '@/core/config/Env';
import OpenAI from 'openai';

// Determine whether to use the real OpenAI client or the mock one
export const openai = new OpenAI({
  apiKey: Env.OPENAI_API_KEY,
});
