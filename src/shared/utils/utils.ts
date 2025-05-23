import type { ClassValue } from 'clsx';
import type { ZodError } from 'zod';
import { clsx } from 'clsx';

import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to clean markdown content
export const cleanMarkdownContent = (content: string): string => {
  // If content is undefined or empty, return empty string
  if (!content) {
    console.log('cleanMarkdownContent: content is empty or undefined');
    return '';
  }

  // Check if content is wrapped in a code block and extract it
  const codeBlockRegex = /```(?:markdown)?\n([\s\S]*)\n```/;
  const match = content.match(codeBlockRegex);

  if (match && match[1]) {
    console.log('cleanMarkdownContent: found code block match');
    // Return the content inside the code block
    return match[1].trim();
  }

  // Check if content is wrapped in HTML pre/code tags
  const htmlCodeBlockRegex = /<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/;
  const htmlMatch = content.match(htmlCodeBlockRegex);

  if (htmlMatch && htmlMatch[1]) {
    console.log('cleanMarkdownContent: found HTML code block match');
    // Return the content inside the HTML code block
    return htmlMatch[1].trim();
  }

  // If no code block wrapping is detected, return the original content
  console.log('cleanMarkdownContent: no matches found, returning original content');
  return content;
};

/**
 * Processes a server-sent event stream from an API route
 * @param response The response from the API route
 * @param onChunk Callback function to handle each chunk of data
 * @returns Promise that resolves when the stream is complete
 */
export async function processServerSentEvents(
  response: Response,
  onChunk: (content: string) => void,
): Promise<void> {
  if (!response.ok) {
    // Handle error response
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to process stream');
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      // Parse the SSE format
      const lines = chunk.split('\n\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6));
            if (data.content) {
              onChunk(data.content);
            }
          } catch {
            // Ignore parsing errors for incomplete chunks
          }
        }
      }
    }
  } catch (error) {
    console.error('Error reading stream:', error);
    throw error;
  }
}

export function formatDateTime(date: Date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

// helper function to make Zod errors readable
export const parseZodError = (error: ZodError) => {
  return error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
};
