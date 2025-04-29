import { z } from 'zod';

// Validation schema for generateFeedback
export const generateFeedbackSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  part1Questions: z.string(),
  part2Questions: z.string(),
  part3Questions: z.string(),
  fullTranscript: z.string().min(1, 'Transcript is required'),
  part1Transcript: z.string().optional(),
  part2Transcript: z.string().optional(),
  part3Transcript: z.string().optional(),
});
export type GenerateFeedbackParams = z.infer<typeof generateFeedbackSchema>;

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
