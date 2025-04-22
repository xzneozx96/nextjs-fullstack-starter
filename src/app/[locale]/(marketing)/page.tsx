import type { Metadata } from 'next';
import { Faq } from '@/shared/components/home/FAQs';
import { Feature } from '@/shared/components/home/Features';
import { Footer } from '@/shared/components/home/Footer';
import { HomeNav } from '@/shared/components/home/Header';
import Hero from '@/shared/components/home/Hero';
import { HowItWorks } from '@/shared/components/home/HowItWorks';
import React from 'react';

export const metadata: Metadata = {
  title:
    'IELTS MentorPro | AI-powered IELTS preparation',
  description: 'IELTS MentorPro helps you prepare for IELTS with AI-powered insights and expert guidance.',
};

export default function Home() {
  return (
    <>
      <HomeNav />
      <Hero />
      <Feature />
      <HowItWorks />
      <Faq />
      <Footer />
    </>
  );
}
