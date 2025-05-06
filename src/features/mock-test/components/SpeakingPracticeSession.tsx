'use client';

import type { FullUser } from '@/features/auth/utils/currentUser';
import type { QuestionBank, Topic } from '../types/question-bank';
import { CALL_STATUS, useVapi } from '@/features/mock-test/hooks/useVapi';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar/Avatar';
import Button from '@/shared/components/ui/button/Button';
import { Card } from '@/shared/components/ui/card/Card';
import { ChevronLeftIcon } from '@/shared/icons';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useFeedbackStore } from '../stores/useFeedbackStore';
import { VapiButton } from './VapiButton';
import { VapiConversation } from './VapiConversation';

type SpeakingPracticeSessionProps = {
  topic: Topic;
  questions: QuestionBank[];
  currentUser: FullUser;
};

const SpeakingPracticeSession = ({ topic, questions, currentUser }: SpeakingPracticeSessionProps) => {
  // Use our custom hook for vapi functionality
  const {
    toggleCall,
    messages,
    callStatus,
    activeTranscript,
    audioLevel,
    currentCallId,
  } = useVapi();

  // Use the Zustand store
  const { setSelectedTopic, setSelectedQuestions, resetStore } = useFeedbackStore();

  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Reset the store and update with the current topic and questions
  // We use a ref to ensure this only runs once when the component mounts
  const hasReset = useRef(false);

  useEffect(() => {
    // Only reset the store once when the component mounts
    if (!hasReset.current) {
      // Reset the store to clear any previous conversation history and feedback
      resetStore();
      hasReset.current = true;
    }

    // Then set the current topic and questions
    setSelectedTopic(topic);
    setSelectedQuestions(questions);

    // Also clear the lastVapiCallId from localStorage to prevent loading old recordings
    localStorage.removeItem('lastVapiCallId');
  }, [topic, questions, setSelectedTopic, setSelectedQuestions, resetStore]);

  // auto-scroll messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden pb-4 sm:pb-6">
      <div className="container mx-auto px-4 h-full max-w-5xl py-6 sm:py-10 md:py-16 lg:py-20">
        {/* Back Link */}
        <motion.div
          className="mb-4 sm:mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href={`/mock-test/topics/speaking/${topic.id}`}
            className="text-blue-600 inline-flex items-center gap-1 text-sm sm:text-base"
          >
            <ChevronLeftIcon className="size-4 sm:size-5" />
            Back to Questions
          </Link>
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center mb-4 sm:mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl sm:text-2xl md:text-title-sm font-medium">
            <span>IELTS Speaking Practice: </span>
            <span className="text-blue-600">{topic.title}</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Have a conversation with our AI tutor to practice your speaking skills
          </p>
        </motion.div>

        {/* VIDEO CALL AREA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6 md:mb-8">
          {/* AI ASSISTANT CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-card/90 border shadow-none overflow-hidden relative">
              <div className="aspect-video flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 relative">
                {/* AI IMAGE */}
                <div className="relative size-20 sm:size-24 md:size-32 mb-2 sm:mb-3 md:mb-4">
                  <div
                    className={`absolute inset-0 bg-blue-500 opacity-10 rounded-full blur-lg ${
                      callStatus === CALL_STATUS.ACTIVE ? 'animate-pulse' : ''
                    }`}
                  />

                  <div className="relative w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-blue-600/10"></div>
                    <div
                      style={{
                        backgroundImage: 'url(\'/images/user/ielts-expert.png\')',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        width: '100%',
                        height: '100%',
                      }}
                      aria-label="AI Assistant"
                    />
                  </div>
                </div>

                <h4 className="text-base sm:text-lg md:text-xl font-medium text-foreground">Mark Anderson</h4>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">IELTS Speaking Coach</p>

                {/* SPEAKING INDICATOR */}
                <div
                  className={`mt-2 sm:mt-3 md:mt-4 flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1
                    rounded-full bg-card border border-border ${callStatus === CALL_STATUS.ACTIVE ? 'border-blue-500' : ''}`}
                >
                  <div
                    className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${
                      callStatus === CALL_STATUS.ACTIVE ? 'bg-blue-500 animate-pulse' : 'bg-muted'
                    }`}
                  />

                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    {callStatus === CALL_STATUS.ACTIVE
                      ? 'Speaking...'
                      : callStatus === CALL_STATUS.LOADING
                        ? 'Connecting...'
                        : callStatus === CALL_STATUS.INACTIVE
                          ? 'Session ended'
                          : 'Waiting...'}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* USER CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-card/90 border shadow-none overflow-hidden relative">
              <div className="aspect-video flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 relative">
                {/* User Image */}
                <div className="relative size-20 sm:size-24 md:size-32 mb-2 sm:mb-3 md:mb-d">
                  <Avatar className="size-full text-title-md">
                    <AvatarFallback className="bg-orange-100">{currentUser.username[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>

                <h4 className="text-base sm:text-lg md:text-xl font-medium text-foreground">You</h4>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                  {currentUser.username}
                </p>

                {/* User Ready Text */}
                <div
                  className="mt-2 sm:mt-3 md:mt-4 flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1
                  rounded-full bg-card border"
                >
                  <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-green-500" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Ready</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* MESSAGE CONTAINER */}
        {messages.length > 0 && (
          <motion.div
            ref={messageContainerRef}
            className="hidden md:block w-full bg-card/90 border rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 md:mb-8
              h-[200px] sm:h-[250px] md:h-[300px] overflow-y-auto transition-all duration-300 scroll-smooth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="space-y-2 sm:space-y-3">
              <VapiConversation
                messages={messages}
                activeTranscript={activeTranscript}
              />

              {callStatus === CALL_STATUS.INACTIVE && (
                <div className="message-item animate-fadeIn">
                  <div className="font-medium text-[10px] sm:text-xs text-blue-500 mb-0.5 sm:mb-1">System:</div>
                  <p className="text-xs sm:text-sm md:text-base text-foreground">
                    Your speaking practice session has ended. You can review your performance or start a new session.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* CALL CONTROLS */}
        <motion.div
          className="text-center flex justify-center items-center gap-3 sm:gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <VapiButton
            audioLevel={audioLevel}
            callStatus={callStatus}
            toggleCall={toggleCall}
            assistantVariables={{
              part1Questions: questions.filter(q => q.part === 'part1').map(q => q.questionText).join('\n'),
              part2Questions: questions.filter(q => q.part === 'part2').map(q => q.questionText).join('\n'),
              part3Questions: questions.filter(q => q.part === 'part3').map(q => q.questionText).join('\n'),
            }}
          />

          {messages.length > 0 && callStatus === CALL_STATUS.INACTIVE && (
            <Link href={`/mock-test/feedback?topicId=${topic.id}`}>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  // Store call ID in localStorage for the feedback page
                  if (currentCallId) {
                    localStorage.setItem('lastVapiCallId', currentCallId);
                  }
                }}
              >
                View Feedback
              </Button>
            </Link>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SpeakingPracticeSession;
