'use client';

import type React from 'react';

import { AngleRightIcon, CheckSolidIcon } from '@/shared/icons';
import { cn } from '@/shared/utils/utils';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Button from '../ui/button/Button';

type Feature = {
  id: number;
  title: string;
  description: string;
  details?: string[];
  image?: string;
};

const HowItWorks = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const features: Feature[] = [
    {
      id: 1,
      title: 'Teacher creates exam',
      description: 'Teachers can easily create customized IELTS exams through our intuitive interface.',
      details: [
        'Drag-and-drop exam builder',
        'Import from question bank',
        'Set time limits and criteria',
      ],
      image: '/images/carousel/carousel-01.png',
    },
    {
      id: 2,
      title: 'Student takes test',
      description: 'Students complete the assigned tests in a timed environment that simulates the real IELTS exam experience.',
      details: [
        'Realistic exam simulation',
        'Speaking test in real-time with AI teacher',
        'Automatic time management',
      ],
      image: '/images/carousel/carousel-02.png',
    },
    {
      id: 3,
      title: 'AI feedback + teacher review',
      description: 'Students receive instant AI-generated feedback with detailed scoring and improvement suggestions after each test. Teachers can review and provide personalized feedback.',
      details: [
        'Detailed band score breakdown',
        'Specific improvement suggestions',
        'Teacher annotations and comments',
      ],
      image: '/images/carousel/carousel-03.png',
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      controls.start('visible');
    }
  }, [isVisible, controls]);

  useEffect(() => {
    // Auto-rotate through features
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [features.length]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <section ref={sectionRef} className="py-16 lg:py-32 relative overflow-hidden bg-gray-50 dark:bg-gray-900" id="how-it-works">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#0F1629] to-transparent -z-10"></div>
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#0F1629] to-transparent -z-10"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#465FFF]/5 rounded-full filter blur-[100px] -z-10"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#0BA5EC]/5 rounded-full filter blur-[100px] -z-10"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <p className="hover:bg-brand-100 bg-brand-50 group mx-auto flex w-fit items-center gap-4 rounded-full py-1 px-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:bg-brand-500/[0.12] dark:text-brand-400">
            <span className="text-brand-500 text-sm">How it works</span>
          </p>
          <h2 className="text-title-md font-medium md:text-title-lg mb-4">Simple, effective, and powerful</h2>
          <p className="text-xl text-gray-500 dark:text-gray-300">
            IELTS MentorPro streamlines the IELTS preparation process for both teachers and students.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
          {/* Left column - Feature list */}
          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                className={`p-6 rounded-xl border dark:border-white/[0.05] transition-all cursor-pointer ${
                  activeFeature === index
                    ? 'bg-brand-25 dark:bg-brand-500/[0.06] dark:text-brand-400 border-brand-500 shadow-md shadow-zinc-950/5'
                    : 'bg-background dark:border-gray-800 dark:bg-white/[0.03]'
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <div className="flex items-start">
                  <div>
                    <span
                      className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 transition-colors ${
                        activeFeature === index ? 'bg-brand-500/[0.08] text-brand-500' : 'bg-gray-100 text-gray-500 dark:text-gray-300 dark:bg-white/[0.05]'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h3
                      className={`font-medium text-lg mb-2 transition-colors ${
                        activeFeature === index ? 'text-brand-500 dark:text-white' : 'text-gray-800 dark:text-white'
                      }`}
                    >
                      {feature.title}
                    </h3>
                    <p className={cn('text-gray-500 dark:text-gray-300', activeFeature === index && 'mb-4 pb-4 border-b border-gray-300 dark:border-gray-700')}>{feature.description}</p>

                    <AnimatePresence>
                      {/* {activeFeature === index && ( */}
                      <motion.div
                        initial={{ height: activeFeature === index ? 'auto' : 0, opacity: 0 }}
                        animate={{ height: activeFeature === index ? 'auto' : 0, opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <ul className="space-y-2">
                          {feature.details?.map(detail => (
                            <li key={detail} className="flex items-start">
                              <CheckSolidIcon className="w-5 h-5 text-brand-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-500 dark:text-gray-300">{detail}</span>
                            </li>
                          ))}
                        </ul>

                        <Button className="p-0 mt-8 flex items-center group">
                          Explore now
                          <AngleRightIcon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </motion.div>
                      {/* )} */}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right column - Feature visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="bg-background rounded-2xl overflow-hidden border shadow-md shadow-zinc-950/5 aspect-square max-w-lg mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full relative"
                >
                  {/* Feature visualization */}
                  {features[activeFeature]?.image && (
                    <Image
                      src={features[activeFeature].image || '/placeholder.svg'}
                      alt={features[activeFeature].title}
                      fill
                      className="object-cover"
                    />
                  )}

                  {/* <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A]/80 via-transparent to-transparent z-10"></div> */}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Feature navigation dots */}
            <div className="flex justify-center mt-8 space-x-2">
              {features.map((feature, index) => (
                <button
                  type="button"
                  key={feature.id}
                  onClick={() => setActiveFeature(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === activeFeature ? 'bg-brand-500 w-8' : 'bg-gray-200'
                  }`}
                  aria-label={`Go to feature ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export { HowItWorks };
