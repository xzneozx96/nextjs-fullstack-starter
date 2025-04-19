import OpenAI from 'openai';
import { Env } from './Env';

// Create a singleton instance of the OpenAI client
export const openai = new OpenAI({
  apiKey: Env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Only for client-side usage
});
