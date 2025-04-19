import type { Topic } from '@/types/question-bank';
import { mockQuestions } from '@/data/mock-questions';
import {
  MicrophoneIcon,
} from '@/icons';
import { cn } from '@/libs/utils';
import Link from 'next/link';

export default function TestsListPage() {
  // Type assertion for the imported JSON data
  const typedMockData = mockQuestions as unknown as { topics: Topic[] };
  const speakingTopics = typedMockData.topics;

  return (
    <div className="container mx-auto py-20">
      <div className="text-center mb-10">
        <h1 className="text-title-md font-medium text-gray-800 mb-4">IELTS Speaking Topics</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Select a topic to practice your IELTS speaking skills. Each topic includes common questions
          and vocabulary that might appear in your IELTS speaking test.
        </p>
      </div>

      {/* Grid layout with 5 items per row on large screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {speakingTopics.map(topic => (
          <Link
            key={topic.id}
            href={`/mock-test/topics/speaking/${topic.id}`}
            className="block group"
          >
            <div className="h-full border rounded-xl p-6 transition-all duration-300 hover:shadow-md flex flex-col">
              <div className="mb-4">
                <span className={cn('flex size-12 items-center justify-center rounded-full text-blue-500 bg-blue-500/[0.08]')}>
                  <MicrophoneIcon className="size-5" />
                </span>
              </div>
              <h3 className="font-medium text-lg mb-2 transition-colors">
                {topic.title}
              </h3>
              <p className="text-sm text-gray-500 flex-grow">
                {topic.description}
              </p>
              <div className="mt-8 text-sm text-blue-600 font-medium">
                Practice Now →
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Additional options at the bottom */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
        <div className="border rounded-xl p-6 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
          <div className="text-center">
            <h3 className="font-medium text-lg mb-2">View All Topics</h3>
            <p className="text-sm text-gray-500">
              Browse our complete collection of IELTS speaking topics
            </p>
          </div>
        </div>
        <div className="border rounded-xl p-6 flex items-center justify-center bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
          <div className="text-center">
            <h3 className="font-medium text-lg mb-2">Start Random Practice</h3>
            <p className="text-sm text-gray-500">
              Challenge yourself with random speaking topics
            </p>
          </div>
        </div>
      </div> */}
    </div>
  );
}
