'use client';

import type { QuestionBank, Topic } from '@/features/mock-test/types/question-bank';
import SpeakingPracticeSession from '@/features/mock-test/components/SpeakingPracticeSession';
import { mockQuestions } from '@/features/mock-test/constants/mock-questions';
import Button from '@/shared/components/ui/button/Button';
import {
  ChevronLeftIcon,
  MicrophoneIcon,
} from '@/shared/icons';
import { cn } from '@/shared/libs/utils';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useState } from 'react';

// Common vocabulary for each topic
const topicVocabulary: Record<string, string[]> = {
  1: ['accommodation', 'residence', 'dwelling', 'spacious', 'cozy', 'furnished', 'amenities', 'neighborhood', 'renovate', 'lease'],
  2: ['profession', 'occupation', 'career', 'colleague', 'workload', 'deadline', 'promotion', 'qualification', 'expertise', 'remote'],
  3: ['curriculum', 'academic', 'qualification', 'graduate', 'discipline', 'lecture', 'assignment', 'research', 'scholarship', 'vocational'],
  4: ['destination', 'journey', 'itinerary', 'commute', 'transit', 'expedition', 'navigation', 'voyage', 'excursion', 'wanderlust'],
  5: ['innovation', 'digital', 'interface', 'algorithm', 'automation', 'software', 'hardware', 'network', 'database', 'cybersecurity'],
  6: ['ecosystem', 'biodiversity', 'conservation', 'sustainable', 'renewable', 'pollution', 'climate', 'habitat', 'preservation', 'emissions'],
  7: ['wellness', 'nutrition', 'exercise', 'metabolism', 'cardiovascular', 'immunity', 'hydration', 'endurance', 'vitality', 'longevity'],
  8: ['cuisine', 'ingredient', 'recipe', 'culinary', 'nutrition', 'delicacy', 'appetizer', 'beverage', 'dessert', 'gastronomy'],
  9: ['recreation', 'pastime', 'entertainment', 'leisure', 'relaxation', 'enjoyment', 'diversion', 'amusement', 'interest', 'enthusiasm'],
  10: ['broadcast', 'journalism', 'publication', 'audience', 'platform', 'content', 'network', 'editorial', 'coverage', 'transmission'],
  11: ['heritage', 'tradition', 'festival', 'ceremony', 'exhibition', 'artifact', 'masterpiece', 'creativity', 'performance', 'cultural'],
  12: ['relationship', 'connection', 'interaction', 'generation', 'relative', 'sibling', 'parental', 'household', 'ancestry', 'lineage'],
  13: ['climate', 'temperature', 'precipitation', 'forecast', 'humidity', 'seasonal', 'meteorology', 'atmospheric', 'tropical', 'temperate'],
  14: ['improvement', 'achievement', 'motivation', 'aspiration', 'confidence', 'discipline', 'mindfulness', 'resilience', 'determination', 'fulfillment'],
  15: ['schedule', 'deadline', 'priority', 'efficiency', 'productivity', 'procrastination', 'multitasking', 'organization', 'punctuality', 'routine'],
};

export default function SpeakingTopicPage() {
  const params = useParams();
  console.log('params', params);
  const id = params.id as string;
  const [showPracticeSession, setShowPracticeSession] = useState(false);

  // Type assertion for the imported JSON data
  const typedMockData = mockQuestions as unknown as { topics: Topic[]; questions: QuestionBank[] };

  // Find the topic
  const topic = typedMockData.topics.find(t => t.id === id);

  // If topic not found, return 404
  if (!topic) {
    notFound();
  }

  // Get questions for this topic
  const topicQuestions = typedMockData.questions.filter(q => q.topicId === id);

  // Group questions by part
  const part1Questions = topicQuestions.filter(q => q.part === 'part1');
  const part2Questions = topicQuestions.filter(q => q.part === 'part2');
  const part3Questions = topicQuestions.filter(q => q.part === 'part3');

  // Get vocabulary for this topic
  const vocabulary = topicVocabulary[id] || [];

  const handleStartPractice = () => {
    setShowPracticeSession(true);
  };

  const handleClosePractice = () => {
    setShowPracticeSession(false);
  };

  if (showPracticeSession) {
    return (
      <SpeakingPracticeSession
        topic={topic}
        questions={topicQuestions}
        onClose={handleClosePractice}
      />
    );
  }

  return (
    <div className="container px-4 sm:px-6 md:px-8 max-w-4xl mx-auto py-6 sm:py-8 md:py-10 lg:py-16">
      <div className="mb-6 sm:mb-8 md:mb-10">
        <Link
          href="/mock-test/topics/speaking"
          className="text-blue-600 inline-flex items-center gap-1 text-sm sm:text-base"
        >
          <ChevronLeftIcon className="size-4 sm:size-5" />
          Back to Topics
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <span>
          <span
            className={cn(
              'flex size-10 sm:size-12 items-center justify-center rounded-full',
              'text-blue-500 bg-blue-500/[0.08]',
            )}
          >
            <MicrophoneIcon className="size-4 sm:size-5" />
          </span>
        </span>
        <div>
          <h1 className="text-xl sm:text-2xl md:text-title-sm font-medium text-gray-800">{topic.title}</h1>
          <p className="text-sm sm:text-base text-gray-500">{topic.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 md:mb-10">
        <div className="border rounded-xl p-3 sm:p-4 lg:p-6">
          <h2 className="text-lg sm:text-xl font-medium mb-3 sm:mb-4">Questions</h2>

          {part1Questions.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <h3 className="font-medium text-blue-600 mb-2 text-sm sm:text-base">Part 1 - Introduction & Interview</h3>
              <ul className="space-y-2 sm:space-y-3">
                {part1Questions.map(question => (
                  <li key={question.questionId} className="flex gap-2 text-sm sm:text-base">
                    <span className="text-blue-500 font-medium flex-shrink-0">•</span>
                    <span>{question.questionText}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {part2Questions.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <h3 className="font-medium text-green-600 mb-2 text-sm sm:text-base">Part 2 - Individual Long Turn</h3>
              <ul className="space-y-2 sm:space-y-3">
                {part2Questions.map(question => (
                  <li key={question.questionId} className="flex gap-2 text-sm sm:text-base">
                    <span className="text-green-500 font-medium flex-shrink-0">•</span>
                    <span>{question.questionText}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {part3Questions.length > 0 && (
            <div>
              <h3 className="font-medium text-purple-600 mb-2 text-sm sm:text-base">Part 3 - Discussion</h3>
              <ul className="space-y-2 sm:space-y-3">
                {part3Questions.map(question => (
                  <li key={question.questionId} className="flex gap-2 text-sm sm:text-base">
                    <span className="text-purple-500 font-medium flex-shrink-0">•</span>
                    <span>{question.questionText}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="border rounded-xl p-3 sm:p-4 lg:p-6">
          <h2 className="text-lg sm:text-xl font-medium mb-3 sm:mb-4">Key Vocabulary</h2>
          <div className="flex flex-wrap gap-2">
            {vocabulary.map(word => (
              <span
                key={word}
                className="px-2 sm:px-3 py-1 bg-gray-100 rounded-full text-xs sm:text-sm text-gray-700"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border rounded-xl p-4 sm:p-6 bg-blue-50">
        <h2 className="text-lg sm:text-xl font-medium mb-3 sm:mb-4">Practice This Topic</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          Ready to practice speaking on this topic? Our AI tutor will ask you questions and provide
          feedback on your responses.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button variant="primary" className="w-full sm:w-auto px-4 sm:px-6" onClick={handleStartPractice}>
            Start Practice Session
          </Button>
          <Button variant="outline" className="w-full sm:w-auto px-4 sm:px-6">
            View Sample Answers
          </Button>
        </div>
      </div>
    </div>
  );
}
