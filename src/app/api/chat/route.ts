import type { Message } from 'ai';
import type { NextRequest } from 'next/server';
import { openaiModels } from '@/features/mock-test/constants/ai-prompts';
import { withError } from '@/middleware';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 60; // Increase timeout for longer responses

export const POST = withError(async (request: NextRequest) => {
  const requestData = await request.json();

  const { messages, systemMessage }: {
    messages: Message[];
    systemMessage: string;
  } = requestData;

  try {
    // Check if we have any messages
    if (messages && messages.length > 0) {
      // Use streamText from Vercel AI SDK for streaming responses
      const result = streamText({
        model: openai(openaiModels.default), // Use the configured model
        system: systemMessage,
        messages,
      });

      return result.toDataStreamResponse();
    } else {
      throw new Error('Invalid request parameters: No messages provided');
    }
  } catch (error) {
    console.error('Error in chat API:', error);
    throw error; // Let the withError middleware handle the error
  }
});
