import { z } from 'zod';

// Validation schema for fetchCallById
export const fetchCallByIdSchema = z.object({
  id: z.string().min(1, 'Call ID is required'),
});
export type FetchCallByIdParams = z.infer<typeof fetchCallByIdSchema>;

// Validation schema for fetchCallHistory
export const fetchCallHistorySchema = z.object({
  limit: z.number().min(1).max(1000).optional().default(10),
});
export type FetchCallHistoryParams = z.infer<typeof fetchCallHistorySchema>;

// Define VAPI API response types based on the documentation
export type VapiCallArtifact = {
  messages?: Array<{
    role: string;
    message: string;
    time?: number;
    endTime?: number;
    secondsFromStart?: number;
  }>;
  messagesOpenAIFormatted?: Array<{
    role: string;
    [key: string]: any;
  }>;
  recordingUrl?: string;
  stereoRecordingUrl?: string;
  videoRecordingUrl?: string;
  videoRecordingStartDelaySeconds?: number;
  transcript?: string;
  pcapUrl?: string;
};

export type VapiCallResponse = {
  id: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
  type?: 'inboundPhoneCall' | 'outboundPhoneCall' | 'webCall' | 'vapi.websocketCall';
  status?: string;
  startedAt?: string;
  endedAt?: string;
  cost?: number;
  costBreakdown?: {
    transport?: number;
    stt?: number;
    llm?: number;
    tts?: number;
    vapi?: number;
    total?: number;
    llmPromptTokens?: number;
    llmCompletionTokens?: number;
    ttsCharacters?: number;
    [key: string]: any;
  };
  artifact?: VapiCallArtifact;
  assistantId?: string;
  name?: string;
  recordingNotReady?: boolean; // custom property for front-end only
  [key: string]: any;
};

export type VapiCallListResponse = VapiCallResponse[];

// Define server action response type
export type ServerActionResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
  recordingNotReady?: boolean;
  message?: string;
};
