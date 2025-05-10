import { z } from 'zod';

const _signUpSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});
export type SignUpPayload = z.infer<typeof _signUpSchema>;

const _signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type SignInPayload = z.infer<typeof _signInSchema>;
