import { z } from 'zod';

// Validation schema for generateFeedback
export const generateFeedbackSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  part1Questions: z.string().min(1, 'No questions found for speaking part 1'),
  part2Questions: z.string().min(1, 'No questions found for speaking part 2'),
  part3Questions: z.string().min(1, 'No questions found for speaking part 3'),
  fullTranscript: z.string().min(1, 'Transcript is required'),
  part1Transcript: z.string().optional(),
  part2Transcript: z.string().optional(),
  part3Transcript: z.string().optional(),
});
export type GenerateFeedbackParams = z.infer<typeof generateFeedbackSchema>;
