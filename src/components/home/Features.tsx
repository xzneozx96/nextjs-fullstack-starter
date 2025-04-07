'use client';

import { AcademicCapIcon, ChartPieIcon, ChatIcon, RocketLaunchIcon } from '@/icons';
import { cn } from '@/libs/utils';
import { motion } from 'framer-motion';
import Image from 'next/image';

type FeatureItem = {
  title: string;
  description: string;
  icon: React.ReactNode;
  colorScheme: string;
  image?: string;
};

const features: FeatureItem[] = [
  {
    title: 'Build IELTS Exams in Minutes',
    description:
      'Teachers can easily create customized IELTS exams through our intuitive interface. Set up full tests or focus on specific skills.',
    icon: <ChartPieIcon className="size-6" />,
    colorScheme: 'text-success-500 bg-success-500/[0.08]',
    image: '/images/carousel/carousel-01.png',
  },
  {
    title: 'Instant AI Feedback',
    description:
      'Students receive instant AI-generated feedback with detailed scoring and improvement suggestions after each test.',
    icon: <ChatIcon className="size-6" />,
    colorScheme: 'text-blue-light-500 bg-blue-500/[0.08]',
    image: '/images/carousel/carousel-02.png',
  },
  {
    title: 'Teacher + AI Collaboration',
    description:
      'Teachers and students work together to create personalized IELTS exams, with AI providing insights and feedback.',
    icon: <AcademicCapIcon className="size-6" />,
    colorScheme: 'text-warning-500 bg-warning-500/[0.08]',
    image: '/images/carousel/carousel-03.png',
  },
  {
    title: 'Reliability',
    description:
      'Our platform ensures consistent, reliable results with AI-powered insights and expert guidance, helping you prepare for success.',
    icon: <RocketLaunchIcon className="size-6" />,
    colorScheme: 'text-theme-pink-500 bg-theme-pink-500/[0.08]',
    image: '/images/carousel/carousel-04.png',
  },
];

const Feature = () => {
  return (
    <section className="py-32">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, filter: 'blur(12px)', y: 12 }}
          whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          viewport={{ once: true }}
          transition={{
            type: 'spring',
            bounce: 0.3,
            duration: 1.5,
          }}
          className="flex w-full flex-col items-center"
        >
          <div className="flex flex-col items-center space-y-4 text-center sm:space-y-6 md:max-w-3xl md:text-center">
            <p className="hover:bg-brand-100 bg-brand-50 group mx-auto flex w-fit items-center gap-4 rounded-full py-1 px-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:shadow-zinc-950">
              <span className="text-brand-500 text-sm">How can we help you</span>
            </p>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.2,
                type: 'spring',
                bounce: 0.3,
                duration: 1.5,
              }}
              className="text-title-md font-medium md:text-title-lg"
            >
              Everything you need to excel in IELTS preparation
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.4,
                type: 'spring',
                bounce: 0.3,
                duration: 1.5,
              }}
              className="text-muted-foreground md:max-w-2xl"
            >
              IELTS MentorPro combines AI technology with expert teaching methods to provide the most effective IELTS preparation experience.
            </motion.p>
          </div>
        </motion.div>
        <div className="relative flex mt-20 justify-center">
          <div className="border-muted2 relative flex w-full flex-col border md:w-1/2 lg:w-full rounded-2xl">
            <div className="relative flex flex-col lg:flex-row">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5 }}
                className="border-muted2 flex flex-col justify-between border-b border-solid p-10 lg:w-3/5 lg:border-r lg:border-b-0"
              >
                <div>
                  <span className={cn('mb-6 flex size-11 items-center justify-center rounded-full bg-background', features?.[0]?.colorScheme)}>
                    {features?.[0]?.icon}
                  </span>
                </div>
                <h2 className="text-lg font-medium md:text-2xl mb-2">{features?.[0]?.title}</h2>
                <p className="text-muted-foreground">{features?.[0]?.description}</p>
                <Image
                  width={500}
                  height={500}
                  src={features?.[0]?.image || ''}
                  alt={features?.[0]?.title || ''}
                  className="mt-8 aspect-[1.5] h-full w-full object-cover lg:aspect-[2.4] rounded-2xl"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col justify-between p-10 lg:w-2/5"
              >
                <div>
                  <span className={cn('mb-6 flex size-11 items-center justify-center rounded-full bg-background', features?.[1]?.colorScheme)}>
                    {features?.[1]?.icon}
                  </span>
                </div>
                <h2 className="text-lg font-medium md:text-2xl mb-2">{features?.[1]?.title}</h2>
                <p className="text-muted-foreground">{features?.[1]?.description}</p>
                <Image
                  width={500}
                  height={500}
                  src={features?.[1]?.image || ''}
                  alt={features?.[1]?.title || ''}
                  className="mt-8 aspect-[1.45] h-full w-full object-cover rounded-2xl"
                />
              </motion.div>
            </div>
            <div className="border-muted2 relative flex flex-col border-t border-solid lg:flex-row">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="border-muted2 flex flex-col justify-between border-b border-solid p-10 lg:w-2/5 lg:border-r lg:border-b-0"
              >
                <div>
                  <span className={cn('mb-6 flex size-11 items-center justify-center rounded-full bg-background', features?.[2]?.colorScheme)}>
                    {features?.[2]?.icon}
                  </span>
                </div>
                <h2 className="text-lg font-medium md:text-2xl mb-2">{features?.[2]?.title}</h2>
                <p className="text-muted-foreground">{features?.[2]?.description}</p>
                <Image
                  width={500}
                  height={500}
                  src={features?.[2]?.image || ''}
                  alt={features?.[2]?.title || ''}
                  className="mt-8 aspect-[1.45] h-full w-full object-cover rounded-2xl"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col justify-between p-10 lg:w-3/5"
              >
                <div>
                  <span className={cn('mb-6 flex size-11 items-center justify-center rounded-full bg-background', features?.[3]?.colorScheme)}>
                    {features?.[3]?.icon}
                  </span>
                </div>
                <h2 className="text-lg font-medium md:text-2xl mb-2">{features?.[3]?.title}</h2>
                <p className="text-muted-foreground">{features?.[3]?.description}</p>
                <Image
                  width={500}
                  height={500}
                  src={features?.[3]?.image || ''}
                  alt={features?.[3]?.title || ''}
                  className="mt-8 aspect-[1.5] h-full w-full object-cover lg:aspect-[2.4] rounded-2xl"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Feature };
