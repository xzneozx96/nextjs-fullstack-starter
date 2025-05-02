import type { Metadata } from 'next';
import SignInForm from '@/shared/components/auth/SignInForm';

export const metadata: Metadata = {
  title: 'SignIn | IELTS MentorPro',
  description: 'SignIn to IELTS MentorPro',
};

export default function SignIn() {
  return <SignInForm />;
}
