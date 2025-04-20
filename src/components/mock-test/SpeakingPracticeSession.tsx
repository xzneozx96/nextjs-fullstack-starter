'use client';

import type { QuestionBank, Topic } from '@/types/question-bank';
import { CALL_STATUS, useVapi } from '@/hooks/useVapi';
import { MessageTypeEnum } from '@/types/vapi-conversation';
import Link from 'next/link';
// import { useUser } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';
import Button from '../ui/button/Button';
import { Card } from '../ui/card/Card';
import { VapiButton } from './VapiButton';
import { VapiConversation } from './VapiConversation';

type SpeakingPracticeSessionProps = {
  topic: Topic;
  questions: QuestionBank[];
  onClose: () => void;
};

const SpeakingPracticeSession = ({ topic, questions }: SpeakingPracticeSessionProps) => {
  // Use our custom hook for vapi functionality
  const { toggleCall, messages, callStatus, activeTranscript, audioLevel }
    = useVapi();

  // const { user } = useUser();
  const user = {
    firstName: 'Ross',
    lastName: 'Geller',
    id: '1234567890',
    imageUrl: '/images/user/user-01.jpg',
  };
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // auto-scroll messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden pb-6">
      <div className="container mx-auto px-4 h-full max-w-5xl py-20">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-title-sm font-medium">
            <span>IELTS Speaking Practice: </span>
            <span className="text-blue-600">{topic.title}</span>
          </h2>
          <p className="text-muted-foreground mt-2">
            Have a conversation with our AI tutor to practice your speaking skills
          </p>
        </div>

        {/* VIDEO CALL AREA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* AI ASSISTANT CARD */}
          <Card className="bg-card/90 border shadow-none overflow-hidden relative">
            <div className="aspect-video flex flex-col items-center justify-center p-10 relative">
              {/* AI IMAGE */}
              <div className="relative size-32 mb-4">
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

              <h4 className="text-xl font-medium text-foreground">Mark Anderson</h4>
              <p className="text-sm text-muted-foreground mt-1">IELTS Speaking Coach</p>

              {/* SPEAKING INDICATOR */}
              <div
                className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border ${
                  callStatus === CALL_STATUS.ACTIVE ? 'border-blue-500' : ''
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    callStatus === CALL_STATUS.ACTIVE ? 'bg-blue-500 animate-pulse' : 'bg-muted'
                  }`}
                />

                <span className="text-xs text-muted-foreground">
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

          {/* USER CARD */}
          <Card className="bg-card/90 border shadow-none overflow-hidden relative">
            <div className="aspect-video flex flex-col items-center justify-center p-10 relative">
              {/* User Image */}
              <div className="relative size-32 mb-4">
                <div
                  style={{
                    backgroundImage: `url(${user?.imageUrl || '/default-avatar.png'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    width: '100%',
                    height: '100%',
                    borderRadius: '100%',
                  }}
                  aria-label="User"
                />
              </div>

              <h4 className="text-xl font-medium text-foreground">You</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {user ? (`${user.firstName} ${user.lastName || ''}`).trim() : 'Guest'}
              </p>

              {/* User Ready Text */}
              <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-card border">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">Ready</span>
              </div>
            </div>
          </Card>
        </div>

        {/* MESSAGE CONTAINER */}
        {messages.length > 0 && (
          <div
            ref={messageContainerRef}
            className="w-full bg-card/90 border rounded-xl p-4 mb-8 h-100 overflow-y-auto transition-all duration-300 scroll-smooth"
          >
            <div className="space-y-3">
              <VapiConversation
                messages={messages}
                activeTranscript={activeTranscript}
              />

              {callStatus === CALL_STATUS.INACTIVE && (
                <div className="message-item animate-fadeIn">
                  <div className="font-semibold text-xs text-blue-500 mb-1">System:</div>
                  <p className="text-foreground">
                    Your speaking practice session has ended. You can review your performance or start a new session.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CALL CONTROLS */}
        <div className="text-center flex justify-center gap-4">
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
                onClick={() => {
                  // Store messages in localStorage for the feedback page
                  const transcript = messages.filter(msg => msg.type === MessageTypeEnum.TRANSCRIPT).map(({ role, transcript }) => ({ role, transcript }));
                  localStorage.setItem('speakingMessages', JSON.stringify(transcript));
                }}
              >
                View Feedback
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeakingPracticeSession;
