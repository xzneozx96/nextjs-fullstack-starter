import { z } from 'zod';

export const signUpSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});
export type SignUpPayload = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type SignInPayload = z.infer<typeof signInSchema>;
