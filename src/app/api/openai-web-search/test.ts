import type { NextRequest } from 'next/server';
import { POST } from './route';

// This is a simple test function to verify the OpenAI web search API
async function testWebSearch() {
  try {
    // Create a mock request
    const mockRequest = new Request('http://localhost:3000/api/openai-web-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'What are the latest trends in health and wellness e-commerce?',
      }),
    }) as NextRequest;

    // Call the API handler
    const response = await POST(mockRequest);

    // Parse the response
    const data = await response.json();

    console.log('Web search test result:', data);
    return data;
  } catch (error) {
    console.error('Error testing web search:', error);
    throw error;
  }
}

// To run this test, uncomment the line below and execute this file
// testWebSearch();

export { testWebSearch };
