'use client';

import type { FeedbackParams } from '@/services/feedbackService';
import type { QuestionBank, Topic } from '@/types/question-bank';
import type { Message, TranscriptMessage } from '@/types/vapi-conversation';
import { mockQuestions } from '@/data/mock-questions';
import { useAISpeakingFeedback } from '@/hooks/useAISpeakingFeedback';
import { ChevronLeftIcon, MicrophoneIcon } from '@/icons';
import { generateFeedback } from '@/services/feedbackService';
import { MessageRoleEnum, MessageTypeEnum } from '@/types/vapi-conversation';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { MarkdownRenderer } from '../ui/markdown/MarkdownRenderer';
import { VapiConversation } from './VapiConversation';

function FeedbackContentMain() {
  const {
    messages,
    setMessages,
    feedbackText,
    processedFeedback,
    setFeedbackText,
    isLoading,
    setIsLoading,
  } = useAISpeakingFeedback();
  const searchParams = useSearchParams();
  const topicId = searchParams.get('topicId');
  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<QuestionBank[]>([]);
  const [hasError, setHasError] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const maxAttempts = 2; // Maximum number of retry attempts

  // Reference to the feedback container for auto-scrolling
  const feedbackContainerRef = useRef<HTMLDivElement>(null);

  // Load topic and questions data
  useEffect(() => {
    if (!topicId) {
      return;
    }

    // Find the topic
    const typedMockData = mockQuestions as unknown as { topics: Topic[]; questions: QuestionBank[] };
    const foundTopic = typedMockData.topics.find(t => t.id === topicId);

    if (foundTopic) {
      // Update state in the next tick to avoid direct setState in useEffect
      const timer = setTimeout(() => {
        setTopic(foundTopic);

        // Get questions for this topic
        const topicQuestions = typedMockData.questions.filter(q => q.topicId === topicId);
        setQuestions(topicQuestions);
      }, 0);

      return () => clearTimeout(timer);
    }

    return () => {};
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

  // Auto-scroll effect when processedFeedback changes
  useEffect(() => {
    if (feedbackContainerRef.current && processedFeedback) {
      const container = feedbackContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [processedFeedback]);

  // Helper function to format questions by part
  const formatQuestionsByPart = useCallback((part: string): string => {
    return questions
      .filter(q => q.part === part)
      .map(q => q.questionText)
      .join('\n');
  }, [questions]);

  // Helper function to format transcript messages
  const formatTranscript = useCallback((messages: TranscriptMessage[]): string => {
    return messages
      .map((msg) => {
        const role = msg.role === MessageRoleEnum.ASSISTANT ? 'Examiner' : 'Student';
        return `${role}: ${msg.transcript}`;
      })
      .join('\n');
  }, []);

  // Function to process streaming response
  const processStreamingResponse = useCallback(async (stream: any): Promise<void> => {
    let accumulatedContent = '';

    // process response from reasoning model
    // for await (const chunk of stream) {
    //   const content = chunk.type === 'response.output_text.delta' ? chunk.delta : '';
    //   accumulatedContent += content;
    //   setFeedbackText(accumulatedContent);
    // }

    // process response from normal model
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      accumulatedContent += content;
      setFeedbackText(accumulatedContent);
    }
  }, [setFeedbackText]);

  // Reset error state when messages change
  useEffect(() => {
    if (messages.length > 0) {
      // Use setTimeout to avoid direct setState in useEffect
      const timer = setTimeout(() => {
        setHasError(false);
        setAttemptCount(0);
      }, 0);

      return () => clearTimeout(timer);
    } else {
      return () => {};
    }
  }, [messages]);

  // Generate feedback when messages are loaded
  useEffect(() => {
    // Skip if we already have feedback, are loading, have an error, or exceeded retry attempts
    if (feedbackText || isLoading || hasError || attemptCount >= maxAttempts) {
      return;
    }

    // Skip if we don't have necessary data
    if (!messages.length || !topic) {
      return;
    }

    const fetchFeedback = async () => {
      setIsLoading(true);
      setAttemptCount(prev => prev + 1);

      try {
        // This is a placeholder for the actual implementation
        // The commented code below shows what would be implemented
        // when the API integration is ready

        // Format the questions for each part
        const part1Questions = formatQuestionsByPart('part1');
        const part2Questions = formatQuestionsByPart('part2');
        const part3Questions = formatQuestionsByPart('part3');

        // Extract only events whose type are 'transcript' from VAPI conversation
        const transcriptMessages = messages.filter(msg => msg.type === MessageTypeEnum.TRANSCRIPT);

        // Organize the transcript into part 1, 2, 3
        // const organizedTranscript = await organizeTranscript(transcriptMessages);

        // // Extract transcript into speaking parts
        // const part1Transcript = formatTranscript(organizedTranscript.part1);
        // const part2Transcript = formatTranscript(organizedTranscript.part2);
        // const part3Transcript = formatTranscript(organizedTranscript.part3);

        // Extract full transcript
        const fullTranscript = formatTranscript(transcriptMessages);

        // Prepare feedback parameters
        const feedbackParams: FeedbackParams = {
          topic: topic.title,
          part1Questions,
          part2Questions,
          part3Questions,
          fullTranscript,
          // part1Transcript,
          // part2Transcript,
          // part3Transcript,
        };

        // Generate and process feedback
        const stream = await generateFeedback(feedbackParams);
        await processStreamingResponse(stream);
      } catch (error) {
        console.error('Error generating feedback:', error);
        setHasError(true); // Mark as error to prevent retries
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [
    messages,
    feedbackText,
    isLoading,
    hasError,
    attemptCount,
    maxAttempts,
    topic,
    formatQuestionsByPart,
    formatTranscript,
    processStreamingResponse,
    setIsLoading,
    setFeedbackText,
  ]);

  return (
    <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-6 md:py-8 flex flex-col
      h-screen md:h-[100dvh] overflow-y-auto md:overflow-hidden"
    >
      {/* Header */}
      <div>
        <div className="mb-6 sm:mb-8 md:mb-10">
          {topicId && (
            <Link
              href={`/mock-test/topics/speaking/${topicId}`}
              className="text-blue-600 inline-flex items-center gap-1 text-sm sm:text-base"
            >
              <ChevronLeftIcon className="size-4 sm:size-5" />
              Back to Topics
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 md:mb-10">
          <span>
            <span className="flex size-10 sm:size-12 items-center justify-center rounded-full
                 text-blue-500 bg-blue-500/[0.08]"
            >
              <MicrophoneIcon className="size-4 sm:size-5" />
            </span>
          </span>
          <div>
            <h1 className="text-lg sm:text-xl font-medium">Speaking Test Feedback</h1>
            <p className="text-sm sm:text-base text-gray-500">
              Receive feedback from our AI tutor on your speaking performance.
            </p>
          </div>
        </div>
      </div>

      {/* Main content - takes all available space */}
      <div className="flex flex-col lg:flex-row flex-1 md:overflow-hidden gap-0 sm:gap-6">
        {/* AI Feedback - full width on mobile, 60% on desktop, shown first on mobile */}
        <div className="w-full lg:w-3/5 flex flex-col p-2 sm:p-3 md:p-4 order-1 lg:order-2">
          <h2 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">AI Feedback</h2>
          <div
            ref={feedbackContainerRef}
            className="h-[300px] md:h-auto md:flex-1 overflow-auto bg-card/90 border rounded-xl p-4"
          >
            {isLoading && !feedbackText
              ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10
                         border-t-2 border-blue-500 mb-2 sm:mb-3"
                    >
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground">Generating feedback...</p>
                  </div>
                )
              : processedFeedback
                ? (
                    <MarkdownRenderer content={processedFeedback} />
                  )
                : (
                    <p className="text-muted-foreground text-center py-4 sm:py-8">
                      No feedback available
                    </p>
                  )}
          </div>
        </div>

        {/* Conversation History - full width on mobile, 40% on desktop, shown second on mobile */}
        <div className="w-full lg:w-2/5 flex flex-col p-2 sm:p-3 md:p-4 order-2 lg:order-1 mt-4 lg:mt-0">
          <h2 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">Conversation History</h2>
          <div className="h-[250px] md:h-auto md:flex-1 overflow-auto bg-card/90 border rounded-xl p-4">
            <div className="space-y-3 sm:space-y-4">
              {messages.length > 0
                ? (
                    <VapiConversation messages={messages} />
                  )
                : (
                    <p className="text-muted-foreground text-center py-4 sm:py-8">
                      No conversation history available
                    </p>
                  )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function FeedbackContent() {
  return (
    <Suspense fallback={null}>
      <FeedbackContentMain />
    </Suspense>
  );
}
