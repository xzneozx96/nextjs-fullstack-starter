import type { QuestionBank, Topic } from '@/features/mock-test/types/question-bank';
import { getCurrentUser } from '@/features/auth/utils/currentUser';
import SpeakingPracticeSession from '@/features/mock-test/components/SpeakingPracticeSession';
import { mockQuestions } from '@/features/mock-test/constants/mock-questions';
import { notFound } from 'next/navigation';

export default async function SpeakingPracticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser({
    withFullUser: true,
    redirectIfNotFound: true,
  });

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

  return (
    <SpeakingPracticeSession
      topic={topic}
      questions={topicQuestions}
      currentUser={user}
    />
  );
};
