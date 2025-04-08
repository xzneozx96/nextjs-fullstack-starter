import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Image from 'next/image';
import Button from '../ui/button/Button';

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

type FaqProps = {
  heading: string;
  description: string;
  items?: FaqItem[];
  supportHeading: string;
  supportDescription: string;
  supportButtonText: string;
  supportButtonUrl: string;
};

const faqItems = [
  {
    id: 'faq-1',
    question: 'How does the AI scoring system work?',
    answer:
        'Our AI scoring system analyzes your writing and speaking responses based on the official IELTS assessment criteria. It evaluates your grammar, vocabulary, coherence, and task achievement to provide a band score that closely matches what a human examiner would give. The AI has been trained on thousands of real IELTS responses and calibrated by certified IELTS examiners.',
  },
  {
    id: 'faq-2',
    question: 'Can teachers customize the exams?',
    answer:
        'Yes, teachers have full control over exam creation. You can create custom exams from scratch, modify existing templates, or use our question bank with over 1,000 pre-made questions. You can set time limits, choose specific skills to test, and even add your own questions and materials.',
  },
  {
    id: 'faq-3',
    question: 'Is the platform suitable for beginners?',
    answer:
        'IELTS MentorPro is designed for test-takers of all levels. Beginners will benefit from our detailed feedback system that identifies areas for improvement and provides targeted practice. The platform adapts to your level and helps you progress at your own pace.',
  },
  {
    id: 'faq-4',
    question: 'How accurate is the AI feedback compared to human examiners?',
    answer:
        'Our AI feedback system has been rigorously tested and shows a 92% correlation with human examiner scores. In blind tests, the difference between AI and human scoring was typically less than 0.5 bands. We continuously improve our AI models with new data and expert input to ensure the highest possible accuracy.',
  },
  {
    id: 'faq-5',
    question: 'What subscription plans are available?',
    answer:
        'We offer flexible subscription plans for both teachers and students. Teachers can choose from monthly or annual plans based on the number of students they need to manage. Students can access basic features for free, with premium features available through subscription. We also offer institutional plans for schools and language centers.',
  },
  {
    id: 'faq-6',
    question: 'Can I integrate this with my school\'s existing LMS?',
    answer:
        'Yes, IELTS MentorPro offers API integration with popular Learning Management Systems like Canvas, Moodle, and Blackboard. We also provide SSO options and can work with your IT team to ensure seamless integration with your existing systems.',
  },
];

const faqHeadline: FaqProps = {
  heading: 'Frequently asked questions',
  items: faqItems,
  description: 'Everything you need to know about IELTS MentorPro and how it can help you achieve your goals.',
  supportHeading: 'Need more support?',
  supportDescription: 'Our dedicated support team is here to help you with any questions or concerns. Get in touch with us for personalized assistance.',
  supportButtonText: 'Contact Support',
  supportButtonUrl: 'https://www.shadcnblocks.com',
};

const Faq = () => {
  return (
    <section className="py-16 lg:py-32" id="faqs">
      <div className="container space-y-16 mx-auto">
        <div className="mx-auto flex max-w-3xl flex-col text-left md:text-center">
          <h2 className="mb-3 text-title-md 2xl:text-title-lg font-medium md:mb-4 lg:mb-6">
            {faqHeadline.heading}
          </h2>
          <p className="text-gray-500 dark:text-gray-300 lg:text-lg">{faqHeadline.description}</p>
        </div>
        <Accordion
          type="single"
          collapsible
          className="mx-auto w-full lg:max-w-3xl"
        >
          {faqItems.map(item => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="transition-opacity duration-200 hover:no-underline hover:opacity-60">
                <div className="font-medium text-gray-800 sm:py-1 lg:py-2 lg:text-lg dark:text-white">
                  {item.question}
                </div>
              </AccordionTrigger>
              <AccordionContent className="sm:mb-1 lg:mb-2">
                <div className="text-gray-500 dark:text-gray-300 lg:text-lg">
                  {item.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mx-auto flex max-w-4xl flex-col items-center rounded-lg bg-brand-500 text-white p-4 text-center md:rounded-xl md:p-6 lg:p-8" id="contact">
          <div className="relative mb-12">
            <Image
              width={32}
              height={32}
              className="inline-block dark:hidden"
              src="./images/logo/logo.svg"
              alt="Logo"
            />
            <Image
              width={32}
              height={32}
              className="hidden dark:inline-block"
              src="./images/logo/logo-dark.svg"
              alt="Logo"
            />
          </div>
          <h3 className="mb-2 max-w-2xl text-title-sm font-medium">
            {faqHeadline.supportHeading}
          </h3>
          <p className="mb-12 max-w-2xl lg:text-lg">
            {faqHeadline.supportDescription}
          </p>
          <div className="flex w-full flex-col justify-center gap-2 sm:flex-row">
            <Button variant="outline" className="w-full sm:w-auto">
              <a href={faqHeadline.supportButtonUrl} target="_blank" rel="noopener noreferrer">
                {faqHeadline.supportButtonText}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Faq };
