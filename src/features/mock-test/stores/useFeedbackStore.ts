'use client';

import type { VapiCallArtifact } from '../actions/vapi/vapi-actions.validation';
import type { QuestionBank, Topic } from '../types/question-bank';
import type { Message, TranscriptMessageTypeEnum } from '../types/vapi-conversation';
import { cleanMarkdownContent, formatDateTime } from '@/shared/utils/utils';
import { create } from 'zustand';
import { MessageRoleEnum, MessageTypeEnum } from '../types/vapi-conversation';

type FeedbackState = {
  // State
  messages: Message[];
  transcript: string;
  feedbackText: string;
  processedFeedback: string;
  isLoading: boolean;
  selectedTopic: Topic | null;
  selectedQuestions: QuestionBank[];
  timestamp: string | null;

  // Actions
  setMessagesAndTranscriptFromCallDetails: (callDetails: { artifact?: VapiCallArtifact }) => void;
  setFeedbackText: (text: string) => void;
  setIsLoading: (loading: boolean) => void;
  clearFeedback: () => void;
  setSelectedTopic: (topic: Topic | null) => void;
  setSelectedQuestions: (questions: QuestionBank[]) => void;
  setTimestamp: (timestamp: string | null) => void;
  resetStore: () => void; // New action to reset the entire store
};

export const useFeedbackStore = create<FeedbackState>(set => ({
  // Initial state
  messages: [],
  transcript: '',
  feedbackText: '',
  processedFeedback: '',
  isLoading: false,
  selectedTopic: null,
  selectedQuestions: [],
  timestamp: null,

  // Actions
  setMessagesAndTranscriptFromCallDetails: (callDetails) => {
    if (callDetails?.artifact?.messages && callDetails.artifact.messages.length > 0) {
      // Convert VAPI API message format to our internal Message format
      // Filter out SYSTEM messages as well
      const convertedMessages = callDetails.artifact.messages
        .filter(msg => msg.role !== MessageRoleEnum.SYSTEM)
        .map((msg): Message => {
          return {
            type: MessageTypeEnum.TRANSCRIPT,
            role: msg.role as MessageRoleEnum,
            transcriptType: 'final' as TranscriptMessageTypeEnum,
            transcript: msg.message,
          };
        });

      // Set timestamp from the call details if available
      const timestamp = callDetails?.artifact?.messages?.[0]?.time
        ? formatDateTime(new Date(callDetails.artifact.messages[0].time))
        : formatDateTime(new Date());

      set({
        messages: convertedMessages,
        transcript: callDetails.artifact.transcript,
        timestamp,
      });
    }
  },

  setFeedbackText: (text) => {
    const processed = cleanMarkdownContent(text);

    set({
      feedbackText: text,
      processedFeedback: processed,
    });
  },

  setIsLoading: loading => set({ isLoading: loading }),

  clearFeedback: () => set({
    feedbackText: '',
    processedFeedback: '',
  }),

  setSelectedTopic: topic => set({ selectedTopic: topic }),

  setSelectedQuestions: questions => set({ selectedQuestions: questions }),

  setTimestamp: timestamp => set({ timestamp }),

  // Reset the entire store to its initial state
  resetStore: () => set({
    messages: [],
    feedbackText: '',
    processedFeedback: '',
    isLoading: false,
    selectedTopic: null,
    selectedQuestions: [],
    timestamp: null,
  }),
}));
