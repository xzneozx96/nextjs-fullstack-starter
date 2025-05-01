import type { NextRequest } from 'next/server';
import { openaiModels } from '@/features/mock-test/constants/ai-prompts';
import { withError } from '@/middleware';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 60; // Increase timeout for longer responses

export const POST = withError(async (request: NextRequest) => {
  const { messages } = await request.json();

  try {
    // If this is a follow-up question (not the initial feedback request)
    if (messages && messages.length > 1) {
      // Use streamText from Vercel AI SDK for streaming responses
      const result = streamText({
        model: openai(openaiModels.default), // Use the configured model
        messages: messages.map((message: any) => {
          // If the message has content property (old format), convert it to parts
          if (message.content) {
            return {
              role: message.role,
              content: message.content,
            };
          }
          // If the message already has parts (new format), use it as is
          return message;
        }),
      });

      return result.toDataStreamResponse();
    } else {
      throw new Error('Invalid request parameters');
    }
  } catch (error) {
    console.error('Error in chat API:', error);
    throw error; // Let the withError middleware handle the error
  }
});
