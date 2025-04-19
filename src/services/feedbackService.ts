import { IELTS_FEEDBACK_PROMPT } from '@/data/ai-prompts';
import { openai } from '@/libs/OpenAI';

export type FeedbackResponse = {
  id: string;
  content: string;
  created: number;
};

export type FeedbackParams = {
  topic: string;
  questions: string;
  transcript: string;
};

/**
 * Generates feedback for a speaking test based on the conversation transcript
 * @param messages The conversation messages from the speaking test
 * @param params Additional parameters for the feedback
 * @returns A stream of feedback chunks
 */
export async function generateFeedback(params: FeedbackParams) {
  try {
    const { transcript, topic, questions } = params;

    // Replace the placeholders in the prompt
    const prompt = IELTS_FEEDBACK_PROMPT
      .replace('{{topic}}', topic)
      .replace('{{questions}}', questions)
      .replace('{{transcript}}', transcript);

    // Create a streaming response from OpenAI
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: true,
    });

    return stream;
  } catch (error) {
    console.error('Error generating feedback:', error);
    throw error;
  }
}
