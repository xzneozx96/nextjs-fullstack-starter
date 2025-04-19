import Vapi from '@vapi-ai/web';
import { Env } from './Env';

export const vapi = new Vapi(Env.NEXT_PUBLIC_VAPI_API_KEY);
