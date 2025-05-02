import type { Metadata } from 'next';
import SignUpForm from '@/shared/components/auth/SignUpForm';

export const metadata: Metadata = {
  title: 'SignUp | IELTS MentorPro',
  description: 'SignUp to IELTS MentorPro',
};

export default function SignUp() {
  return <SignUpForm />;
}
