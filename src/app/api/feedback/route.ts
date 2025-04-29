import type { GenerateFeedbackParams } from '@/features/mock-test/actions/ai-feedback/feedback-actions.validation';
import type { NextRequest } from 'next/server';
import { openai } from '@/core/ai/OpenAI';
import { IELTS_FEEDBACK_PROMPT, openaiModels } from '@/features/mock-test/constants/ai-prompts';
import { withError } from '@/middleware';
import { NextResponse } from 'next/server';

export const POST = withError(async (request: NextRequest) => {
  try {
    // Parse the request body
    const data: GenerateFeedbackParams = await request.json();

    // Validate required fields
    if (!data.topic || !data.fullTranscript) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const {
      topic,
      part1Questions,
      part2Questions,
      part3Questions,
      fullTranscript,
    } = data;

    // Replace the placeholders in the prompt
    const prompt = IELTS_FEEDBACK_PROMPT
      .replace('{{topic}}', topic)
      .replace('{{part1Questions}}', part1Questions || '')
      .replace('{{part2Questions}}', part2Questions || '')
      .replace('{{part3Questions}}', part3Questions || '')
      .replace('{{fullTranscript}}', fullTranscript);

    // stream response from ChatGPT using non-thinking model
    // const stream = await openai.chat.completions.create({
    //   model: openaiModels.default,
    //   messages: [
    //     {
    //       role: 'user',
    //       content: prompt,
    //     },
    //   ],
    //   stream: true,
    // });

    // stream response from ChatGPT using reasoning model
    const stream = await openai.responses.create({
      model: openaiModels.reasoning,
      input: prompt,
      reasoning: {
        effort: 'medium',
      },
      stream: true,
    });

    // Create a ReadableStream directly from the OpenAI stream
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        // Process each chunk from the OpenAI stream (non-thinking model)
        // for await (const chunk of stream) {
        //   const content = chunk.choices[0]?.delta?.content || '';
        //   if (content) {
        //     controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
        //   }
        // }

        // Process each chunk from the OpenAI stream (reasoning model)
        for await (const chunk of stream) {
          const content = chunk.type === 'response.output_text.delta' ? chunk.delta : '';
          if (content) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
          }
        }

        // Signal the end of the stream
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    // Return a streaming response
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error generating feedback:', error);

    // Return an error response
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
});
