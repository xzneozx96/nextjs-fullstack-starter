import { z } from 'zod';

// Validation schema for organizeTranscript
export const organizeTranscriptSchema = z.object({
  transcript: z.array(z.any()).min(1, 'Transcript is required'),
});
export type OrganizeTranscriptParams = z.infer<typeof organizeTranscriptSchema>;

// Define response types
export type FeedbackResponse = {
  id: string;
  content: string;
  created: number;
};

export type OrganizeTranscriptResponse = {
  part1: any[];
  part2: any[];
  part3: any[];
};

// Define server action response type
export type ServerActionResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};
