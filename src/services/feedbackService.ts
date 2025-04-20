import type { Message } from '@/types/vapi-conversation';
import { IELTS_FEEDBACK_PROMPT, IELTS_TRANSCRIPT_ORGANIZE_PROMPT } from '@/data/ai-prompts';
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

export async function organizeTranscript(transcript: Message[]) {
  try {
    // Replace the placeholders in the prompt
    const prompt = IELTS_TRANSCRIPT_ORGANIZE_PROMPT
      .replace('{{transcript}}', JSON.stringify(transcript));

    const result = await openai.responses.create({
      model: 'gpt-4o-mini',
      input: prompt,
      reasoning: {
        effort: 'medium',
      },
    });

    return result.output_text || '';
  } catch (error) {
    console.error('Error organizing transcript:', error);
    throw error;
  }
}

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
