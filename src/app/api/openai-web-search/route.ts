import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Set a timeout for the OpenAI API request
const TIMEOUT_MS = 30000; // 30 seconds

export async function POST(req: NextRequest) {
  let timeoutId: NodeJS.Timeout | undefined;

  try {
    // Parse the request body
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 },
      );
    }

    // Create a promise that will be rejected after the timeout
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('OpenAI API request timed out after 30 seconds'));
      }, TIMEOUT_MS);
    });

    // Create the API request promise
    const apiPromise = openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using the cheapest model that supports web search
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that can search the web for information.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'web_search',
            description: 'Search the web for current information',
            parameters: {},
          },
        },
      ],
      tool_choice: 'auto', // Let the model decide when to use the web search tool
      max_tokens: 2000, // Set a reasonable token limit
    });

    // Race between the API call and the timeout
    const response = await Promise.race([apiPromise, timeoutPromise]) as any;

    // Clear the timeout if the API call completes before the timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Return the response
    return NextResponse.json({
      result: response.choices[0].message.content,
    });
  } catch (error: any) {
    // Clear the timeout to prevent memory leaks
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    console.error('Error calling OpenAI API:', error);

    // Provide more specific error information based on the error type
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 },
      );
    } else if (error.status >= 500) {
      return NextResponse.json(
        { error: 'OpenAI server error. Please try again later.' },
        { status: 502 },
      );
    } else if (error.message.includes('timed out')) {
      return NextResponse.json(
        { error: 'Request timed out. Please try with a simpler query.' },
        { status: 504 },
      );
    } else {
      return NextResponse.json(
        { error: `Failed to process request: ${error.message || 'Unknown error'}` },
        { status: 500 },
      );
    }
  }
}
