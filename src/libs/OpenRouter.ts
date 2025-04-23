import { Env } from './Env';

// Define the OpenRouter API types
export type OpenRouterMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type OpenRouterCompletionOptions = {
  model: string;
  messages: OpenRouterMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
};

// OpenRouter API client
class OpenRouterClient {
  private apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  completions = {
    create: async (options: OpenRouterCompletionOptions) => {
      const { model, messages, stream = false, temperature = 0.7, max_tokens } = options;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin, // Required for OpenRouter
          'X-Title': 'IELTS AI Tutor', // Optional, but good practice
        },
        body: JSON.stringify({
          model,
          messages,
          stream,
          temperature,
          max_tokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`);
      }

      if (stream) {
        return this.handleStream(response);
      } else {
        const data = await response.json();
        return data;
      }
    },
  };

  private handleStream(response: Response) {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder('utf-8');

    // Create a stream object that can be used with for-await-of
    return {
      async* [Symbol.asyncIterator]() {
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            // Decode the chunk and add it to the buffer
            buffer += decoder.decode(value, { stream: true });

            // Process the buffer to extract complete SSE messages
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);

                // Check if it's the [DONE] message
                if (data === '[DONE]') {
                  return;
                }

                try {
                  // Parse the JSON data
                  const parsedData = JSON.parse(data);
                  yield parsedData;
                } catch (e) {
                  console.error('Error parsing SSE data:', e);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      },
    };
  }
}

// Create a singleton instance of the OpenRouter client or use the mock
export const openRouter = new OpenRouterClient(Env.NEXT_PUBLIC_OPENROUTER_API_KEY || '');
