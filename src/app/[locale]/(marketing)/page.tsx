import type { Metadata } from 'next';
import { Faq } from '@/components/home/FAQs';
import { Feature } from '@/components/home/Features';
import { Footer } from '@/components/home/Footer';
import { HomeNav } from '@/components/home/Header';
import Hero from '@/components/home/Hero';
import { HowItWorks } from '@/components/home/HowItWorks';
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
