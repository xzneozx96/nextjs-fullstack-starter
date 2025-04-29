'use client';

import type { GenerateFeedbackParams } from '../actions/ai-feedback/feedback-actions.validation';
import type { QuestionBank, Topic } from '../types/question-bank';
import { mockQuestions } from '@/features/mock-test/constants/mock-questions';
import { useVapi } from '@/features/mock-test/hooks/useVapi';
import AudioPlayer from '@/shared/components/ui/audio-player/AudioPlayer';
import { MarkdownRenderer } from '@/shared/components/ui/markdown/MarkdownRenderer';
import { ChevronLeftIcon, MicrophoneIcon } from '@/shared/icons';
import { processServerSentEvents } from '@/shared/utils/utils';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { generateFeedbackAction } from '../actions/ai-feedback/feedback-actions';
import { useFeedbackStore } from '../stores/useFeedbackStore';
import { formatQuestionsByPart } from '../utils/format-questions-by-part';
import { VapiConversation } from './VapiConversation';

function FeedbackContentMain() {
  // Use the Zustand store through our hook
  const {
    messages,
    transcript,
    feedbackText,
    processedFeedback,
    setFeedbackText,
    isLoading,
    setIsLoading,
    setMessagesAndTranscriptFromCallDetails,
    selectedTopic,
    selectedQuestions,
    setSelectedTopic,
    setSelectedQuestions,
    timestamp,
  } = useFeedbackStore();

  // Use the Vapi hook to access the getCallDetails method
  const { getCallDetails } = useVapi();

  const searchParams = useSearchParams();
  const topicId = searchParams.get('topicId');
  const [topic, setTopic] = useState<Topic | null>(null);
  // We'll keep the local state for questions but rename it to avoid confusion
  const [_questions, setQuestions] = useState<QuestionBank[]>([]);
  const [hasError, setHasError] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const maxAttempts = 2; // Maximum number of retry attempts

  // State for call recording
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [isLoadingRecording, setIsLoadingRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  // Reference to the feedback container for auto-scrolling
  const feedbackContainerRef = useRef<HTMLDivElement>(null);

  // Function to fetch call recording and conversation history
  const fetchCallRecording = useCallback(async () => {
    // Skip if we're already loading or if we already have a recording URL
    if (isLoadingRecording || recordingUrl) {
      return;
    }

    const callId = localStorage.getItem('lastVapiCallId');
    if (!callId) {
      setRecordingError('No call ID found');
      return;
    }

    try {
      setIsLoadingRecording(true);
      setRecordingError(null);

      // Use the getCallDetails method from useVapi hook instead of directly calling the server action
      const callDetails = await getCallDetails(callId);

      // Set recording URL if available
      if (callDetails?.artifact?.recordingUrl) {
        setRecordingUrl(callDetails.artifact.recordingUrl);
      } else if (callDetails?.recordingNotReady) {
        // Handle the case where we've retried but recording is still not ready
        setRecordingError('Recording is still being processed. Please try again later.');
      } else {
        setRecordingError('No recording available for this call');
      }

      // Set conversation messages from call details
      if (callDetails?.artifact?.messages && callDetails.artifact.messages.length > 0) {
        // Use the new method to set messages from call details
        setMessagesAndTranscriptFromCallDetails(callDetails);
      }
    } catch (error) {
      console.error('Error fetching call recording:', error);
      setRecordingError('Failed to fetch recording');
    } finally {
      setIsLoadingRecording(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getCallDetails, isLoadingRecording, recordingUrl]); // Added dependencies to prevent unnecessary calls

  // Load topic and questions data
  useEffect(() => {
    if (!topicId) {
      return;
    }

    // Use a timer to avoid direct setState in useEffect
    const timer = setTimeout(() => {
      // If we already have a selected topic in the store, use it
      if (selectedTopic && selectedTopic.id === topicId) {
        // Set the local state to match the store
        setTopic(selectedTopic);
        setQuestions(selectedQuestions);
        return;
      }

      // Otherwise, fetch from mock data
      const typedMockData = mockQuestions as unknown as { topics: Topic[]; questions: QuestionBank[] };
      const foundTopic = typedMockData.topics.find(t => t.id === topicId);

      if (foundTopic) {
        setTopic(foundTopic);
        setSelectedTopic(foundTopic);

        // Get questions for this topic
        const topicQuestions = typedMockData.questions.filter(q => q.topicId === topicId);
        setQuestions(topicQuestions);
        setSelectedQuestions(topicQuestions);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [topicId, selectedTopic, selectedQuestions, setSelectedTopic, setSelectedQuestions]);

  useEffect(() => {
    // Only fetch call recording if we don't already have messages
    // This prevents unnecessary API calls when we already have the data
    if (messages.length === 0) {
      fetchCallRecording();
    }
  }, [fetchCallRecording, messages.length]);

  // Auto-scroll effect when processedFeedback changes
  useEffect(() => {
    if (feedbackContainerRef.current && processedFeedback) {
      const container = feedbackContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [processedFeedback]);

  // Reset error state when messages length changes
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
  }, [messages.length]); // Only depend on messages.length, not the entire messages array

  // Generate feedback when messages are loaded
  useEffect(() => {
    // Skip if we already have feedback, are loading, have an error, or exceeded retry attempts
    if (feedbackText || isLoading || hasError || attemptCount >= maxAttempts) {
      return;
    }

    // Skip if we don't have necessary data
    // Use either the local topic state or the selectedTopic from the store
    if (!messages.length || (!topic && !selectedTopic)) {
      return;
    }

    // Use a ref to track if feedback generation has been initiated
    const isMounted = true;

    const fetchFeedback = async () => {
      // Only proceed if the component is still mounted and we're not already loading
      if (!isMounted || isLoading) {
        return;
      }

      setIsLoading(true);
      setAttemptCount(prev => prev + 1);

      try {
        // Format the questions for each part
        const part1Questions = formatQuestionsByPart('part1', selectedQuestions);
        const part2Questions = formatQuestionsByPart('part2', selectedQuestions);
        const part3Questions = formatQuestionsByPart('part3', selectedQuestions);

        // Extract only events whose type are 'transcript' from VAPI conversation
        // const transcriptMessages = messages.filter(msg => msg.type === MessageTypeEnum.TRANSCRIPT);

        // Extract full transcript
        // const fullTranscript = formatTranscript(transcriptMessages);

        // Prepare feedback parameters - use selectedTopic from the store if available
        const feedbackParams: GenerateFeedbackParams = {
          topic: selectedTopic?.title || topic?.title || 'Unknown Topic',
          part1Questions,
          part2Questions,
          part3Questions,
          fullTranscript: transcript,
          // fullTranscript: `
          // AI: Do you work or are you a student?
          // User: I’m currently working full-time.

          // AI: What is your job?
          // User: I work as a marketing coordinator at a mid-sized tech startup.

          // AI: Why did you choose this job?
          // User: Well, I chose marketing because I enjoy creative writing and analyzing consumer trends. Also, I studied communications at university, so this role fits my background and interests.

          // AI: Now I’m going to give you a topic and I’d like you to talk about it for one to two minutes. You have one minute to prepare and you can make notes if you wish. Do you understand?
          // User: Yes, I do.

          // AI: Your topic is: Describe your dream job. You should say:

          // what the job is

          // what skills or qualifications you would need

          // what the working conditions would be like

          // and explain why this is your dream job.

          // Here is a paper and pencil. You have one minute to prepare. (One-minute pause with soft ticking sound)

          // (Preparation time ends.)

          // AI: Please begin.

          // User: My dream job would be to become an international communications director for a global non-profit organization. In this position, I would oversee public relations campaigns, coordinate with media outlets, and manage cross-cultural communications strategies. To qualify, I’d need a master’s degree in international relations or communications, plus several years of experience in public affairs and multilingual proficiency—ideally English, French, and Mandarin. The working conditions would be dynamic and fast-paced; I imagine frequent travel to conferences and field offices, collaborating with diverse teams in different time zones. This is my dream job because I’m passionate about making a positive impact worldwide and bridging cultural gaps through clear, empathetic messaging. It combines my love of language, travel, and social causes.

          // AI: Thank you. That is the end of Part 2.

          // AI: Let’s talk about work-life balance. How important is work-life balance to people today?
          // User: I think it’s extremely important nowadays. Many people are more aware of stress and burnout, so they look for job flexibility, such as remote working or adjustable hours. Employers that support work-life balance tend to have happier and more productive staff, in my opinion.

          // AI: Do you think people will change careers more frequently in the future?
          // User: Yes, I believe so. With technology evolving quickly, some jobs become obsolete, and new roles emerge. Younger generations also value personal fulfillment over stability, so they’re willing to retrain or switch fields several times during their working life.

          // AI: Thank you. That is the end of the speaking test.
          // User: Thank you.
          // `,
        };

        // Validate parameters using the server action
        const validationResponse = await generateFeedbackAction(feedbackParams);

        // Check for validation errors
        if (validationResponse.error) {
          throw new Error(validationResponse.error);
        }

        if (!validationResponse.validatedParams) {
          throw new Error('Failed to validate feedback parameters');
        }

        // Make a request to the streaming API endpoint
        const response = await fetch(`/api/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(validationResponse.validatedParams),
        });

        // Process the streaming response
        let accumulatedContent = '';
        await processServerSentEvents(response, (content) => {
          accumulatedContent += content;
          setFeedbackText(accumulatedContent);
        });
      } catch (error) {
        console.error('Error generating feedback:', error);
        setHasError(true); // Mark as error to prevent retries
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchFeedback();

    // No cleanup needed as we're using a local variable
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Only run this effect when these dependencies change
    messages.length, // Only care about the length changing, not the messages themselves
    topic,
    selectedTopic, // Include selectedTopic from the store
    // Other dependencies that should trigger feedback generation
    feedbackText,
    hasError,
    attemptCount,
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
              {timestamp && (
                <span className="inline-block mr-2">{timestamp}</span>
              )}
              {selectedTopic && (
                <span className="inline-block font-medium text-blue-600">{selectedTopic.title}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Main content - takes all available space */}
      <div className="flex flex-col lg:flex-row flex-1 md:overflow-hidden gap-0 sm:gap-6">
        {/* AI Feedback - full width on mobile, 60% on desktop, shown first on mobile */}
        <div className="w-full lg:w-3/5 flex flex-col p-4 md:p-6 border rounded-xl order-1 lg:order-2">
          <h2 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">AI Feedback</h2>
          <div
            ref={feedbackContainerRef}
            className="h-[300px] md:h-auto md:flex-1 overflow-auto bg-gray-50/90 rounded-xl p-4 md:p-6"
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
        <div className="w-full lg:w-2/5 flex flex-col p-4 md:p-6 order-2 lg:order-1 mt-4 lg:mt-0 border rounded-xl flex-1">
          <h2 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">Conversation History</h2>

          <div className="h-[250px] md:h-full md:flex-1 overflow-auto bg-gray-50/90 rounded-xl p-4">
            {/* Audio Player */}
            <div className="mb-4">
              {isLoadingRecording
                ? (
                    <div className="flex items-center justify-center h-12 bg-gray-50 rounded-lg">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-blue-500"></div>
                      <span className="ml-2 text-sm text-gray-500">Loading recording...</span>
                    </div>
                  )
                : recordingUrl
                  ? (
                      <AudioPlayer
                        src={recordingUrl}
                        title=""
                        className="mb-8"
                      />
                    )
                  : recordingError
                    ? (
                        <div className="text-sm text-red-500 bg-red-50 p-2 rounded-lg mb-8">
                          {recordingError}
                        </div>
                      )
                    : null}
            </div>

            {/* Conversation Transcript */}
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
