import type { ZodSchema } from 'zod';
import type { SignInPayload } from './auth.validation';
import { http } from '@/core/http/http';

export const loginApi = async (
  payload: SignInPayload,
  schemaValidation?: ZodSchema<SignInPayload>,
): Promise<any> => {
  const data = await http.post({
    url: '/auth/login',
    options: { data: payload },
    schemaValidation,
  });
  return data;
};

export const logoutApi = async (): Promise<any> => {
  const data = await http.post({
    url: '/auth/logout',
  });
  return data;
};
