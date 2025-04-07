import { AnimatedGroup } from '@/components/ui/animated-group';
import { TextEffect } from '@/components/ui/text-effect';
import { AngleRightIcon } from '@/icons';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import Button from '../ui/button/Button';

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(12px)',
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        type: 'spring',
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export default function Hero() {
  return (
    <>
      <main className="overflow-hidden">
        {/* <div
          aria-hidden
          className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
        >
          <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
          <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
        </div> */}
        <section>
          <div className="relative pt-24">
            <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"></div>
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                <AnimatedGroup variants={transitionVariants}>
                  <Link
                    href="#link"
                    className="hover:bg-brand-100 bg-brand-50 group mx-auto flex w-fit items-center gap-4 rounded-full p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:shadow-zinc-950"
                  >
                    <span className="text-brand-500 text-sm">AI-powered IELTS Preparation</span>
                    <div className="bg-brand-100 group-hover:bg-brand-50 size-6 overflow-hidden rounded-full duration-500">
                      <div className="flex w-12 text-brand-500 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                        <span className="flex size-6">
                          <AngleRightIcon className="m-auto size-3" />
                        </span>
                        <span className="flex size-6">
                          <AngleRightIcon className="m-auto size-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </AnimatedGroup>

                <TextEffect
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  as="h1"
                  className="mt-8 text-balance text-title-md font-medium lg:mt-16 xl:text-title-2xl"
                >
                  Ace IELTS Exam with AI-Powered Guidance
                </TextEffect>
                <TextEffect
                  per="line"
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  delay={0.5}
                  as="p"
                  className="mx-auto mt-8 max-w-2xl text-balance text-lg"
                >
                  IELTS MentorPro helps teachers create mock tests in minutes, students get AI-powered insights instantly, and track real progress together
                </TextEffect>

                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.75,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                  className="mt-12 flex flex-col items-center justify-center gap-4 md:flex-row"
                >
                  <Button
                    key={1}
                  >
                    <Link href="#link">
                      <span className="text-nowrap">Take a Mock Test</span>
                    </Link>
                  </Button>
                  <Button
                    key={2}
                    variant="outline"
                  >
                    <Link href="#link">
                      <span className="text-nowrap">Get started as a Teacher</span>
                    </Link>
                  </Button>
                </AnimatedGroup>
              </div>
            </div>

            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.75,
                    },
                  },
                },
                ...transitionVariants,
              }}
            >
              <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                <div
                  aria-hidden
                  className="bg-linear-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                />
                <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-2 shadow-lg shadow-zinc-950/15 ring-1">
                  <Image
                    className="bg-background aspect-15/8 relative hidden rounded-xl dark:block"
                    src="/images/carousel/carousel-01.png"
                    alt="app screen"
                    width="2700"
                    height="1440"
                  />
                  <Image
                    className="z-2 border-border/25 aspect-15/8 relative rounded-xl border dark:hidden"
                    src="/images/carousel/carousel-01.png"
                    alt="app screen"
                    width="2700"
                    height="1440"
                  />
                  {/* <YouTubeEmbed videoId="dQw4w9WgXcQ" /> */}
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>
      </main>
    </>
  );
}
