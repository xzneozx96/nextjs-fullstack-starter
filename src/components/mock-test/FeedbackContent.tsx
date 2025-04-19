'use client';

import type { FeedbackParams } from '@/services/feedbackService';
import type { QuestionBank, Topic } from '@/types/question-bank';
import type { Message } from '@/types/vapi-conversation';
import { mockQuestions } from '@/data/mock-questions';
import { useFeedback } from '@/hooks/useAISpeakingFeedback';
import { ChevronLeftIcon, MicrophoneIcon } from '@/icons';
import { cn } from '@/libs/utils';
import { generateFeedback } from '@/services/feedbackService';
import { MessageRoleEnum, MessageTypeEnum } from '@/types/vapi-conversation';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { MarkdownRenderer } from '../ui/markdown/MarkdownRenderer';
import { VapiConversation } from './VapiConversation';

export const FeedbackContent = () => {
  const { messages, setMessages, feedbackText, setFeedbackText, isLoading, setIsLoading } = useFeedback();
  const searchParams = useSearchParams();
  const topicId = searchParams.get('topicId');
  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<QuestionBank[]>([]);

  // Reference to the feedback container for auto-scrolling
  const feedbackContainerRef = useRef<HTMLDivElement>(null);

  // Load topic and questions data
  useEffect(() => {
    if (topicId) {
      // Find the topic
      const typedMockData = mockQuestions as unknown as { topics: Topic[]; questions: QuestionBank[] };
      const foundTopic = typedMockData.topics.find(t => t.id === topicId);

      if (foundTopic) {
        setTopic(foundTopic);

        // Get questions for this topic
        const topicQuestions = typedMockData.questions.filter(q => q.topicId === topicId);
        setQuestions(topicQuestions);
      }
    }
  }, [topicId]);

  useEffect(() => {
    // Load messages from localStorage
    const storedMessages = localStorage.getItem('speakingMessages');
    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages) as Message[];
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error parsing stored messages:', error);
      }
    }
  }, [setMessages]);

  // Auto-scroll effect when feedbackText changes
  useEffect(() => {
    if (feedbackContainerRef.current && feedbackText) {
      const container = feedbackContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [feedbackText]);

  useEffect(() => {
    // Generate feedback when messages are loaded
    const fetchFeedback = async () => {
      if (messages.length > 0 && !feedbackText && !isLoading && topic) {
        setIsLoading(true);
        try {
          // Extract transcripts from the messages
          const transcript = messages
            .filter(msg => msg.type === MessageTypeEnum.TRANSCRIPT)
            .map((msg) => {
              const role = msg.role === MessageRoleEnum.ASSISTANT ? 'Examiner' : 'Student';

              const transcript = msg.transcript;

              return `${role}: ${transcript}`;
            })
            .join('\n');

          // Format the questions as a bulleted list
          const formattedQuestions = questions.map(q => q.questionText).map(q => `    + ${q}`).join('\n');

          // Prepare feedback parameters
          const feedbackParams: FeedbackParams = {
            topic: `${topic.title}`,
            questions: formattedQuestions,
            transcript,
          };

          const stream = await generateFeedback(feedbackParams);

          // Process the streaming response
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            setFeedbackText((prev: string) => prev + content);
          }
        } catch (error) {
          console.error('Error generating feedback:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchFeedback();
  }, [messages, feedbackText, isLoading, setFeedbackText, setIsLoading, topic, questions]);

  return (
    <div className="container mx-auto py-12 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div>
        <div className="mb-8">
          {topicId && (
            <Link href={`/mock-test/topics/speaking/${topicId}`} className="text-blue-600 flex items-center gap-1">
              <ChevronLeftIcon className="size-5" />
              Back to Topics
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4 mb-8">
          <span className={cn('flex size-12 items-center justify-center rounded-full text-blue-500 bg-blue-500/[0.08]')}>
            <MicrophoneIcon className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-medium">Speaking Test Feedback</h1>
            <p className="text-gray-500">Receive feedback from our AI tutor on your speaking performance.</p>
          </div>
        </div>
      </div>

      {/* Main content - takes all available space */}
      <div className="flex flex-1 overflow-hidden">
        {/* Conversation History - 50% width */}
        <div className="w-1/2 flex flex-col p-4">
          <h2 className="text-lg font-medium mb-3">Conversation History</h2>
          <div className="flex-1 overflow-auto bg-card/90 border rounded-xl p-4">
            <div className="space-y-4">
              {messages.length > 0
                ? (
                    <VapiConversation messages={messages} />
                  )
                : (
                    <p className="text-muted-foreground text-center py-8">
                      No conversation history available
                    </p>
                  )}
            </div>
          </div>
        </div>

        {/* AI Feedback - 50% width */}
        <div className="w-1/2 flex flex-col p-4">
          <h2 className="text-lg font-medium mb-3">AI Feedback</h2>
          <div
            ref={feedbackContainerRef}
            className="flex-1 overflow-auto bg-card/90 border rounded-xl p-4"
          >
            {isLoading && !feedbackText
              ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-muted-foreground">Generating feedback...</p>
                  </div>
                )
              : feedbackText
                ? (
                    <MarkdownRenderer content={feedbackText} />
                  )
                : (
                    <p className="text-muted-foreground text-center py-8">
                      No feedback available
                    </p>
                  )}
          </div>
        </div>
      </div>
    </div>
  );
};
