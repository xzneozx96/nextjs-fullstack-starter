'use server';

import type { ServerActionResponse } from '@/shared/types/global';
import type { FetchCallByIdParams, FetchCallHistoryParams, VapiCallListResponse, VapiCallResponse } from './vapi-actions.validation';
import { Env } from '@/core/config/Env';
import {
  fetchCallByIdSchema,
  fetchCallHistorySchema,
} from './vapi-actions.validation';

/**
 * Server action to fetch call details from the VAPI API
 * @param unsafeData The parameters for the request
 * @returns Promise that resolves to the call details with a standardized response format
 */
export async function fetchCallById(
  unsafeData: FetchCallByIdParams,
): Promise<ServerActionResponse<VapiCallResponse>> {
  // Validate input data using Zod directly
  const validationResult = fetchCallByIdSchema.safeParse(unsafeData);
  if (!validationResult.success) {
    // Format Zod errors into a readable string
    const errorMessage = validationResult.error.errors
      .map(e => `${e.path.join('.')}: ${e.message}`)
      .join(', ');
    return { success: false, error: errorMessage };
  }

  const data = validationResult.data;
  const maxRetries = 5;
  let currentRetry = 0;

  // Exponential backoff starting with 2 seconds
  const getBackoffTime = (retry: number) => Math.min(2000 * 2 ** retry, 30000);

  // First attempt to fetch the call data
  try {
    const response = await fetch(`https://api.vapi.ai/call/${data.id}`, {
      headers: {
        'Authorization': `Bearer ${Env.VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
      // Add next.js cache options
      next: {
        revalidate: 0, // Don't cache during initial fetch
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = `Failed to fetch call details: ${response.status} ${response.statusText}${errorData ? ` - ${JSON.stringify(errorData)}` : ''}`;
      console.error(errorMessage);
      return { success: false, error: errorMessage };
    }

    let callData = await response.json();

    // If recording URL is not available, retry with exponential backoff
    while (!callData.artifact?.recordingUrl && currentRetry < maxRetries) {
      currentRetry++;
      const backoffTime = getBackoffTime(currentRetry);
      console.log(`Recording not ready yet. Retrying in ${backoffTime}ms (attempt ${currentRetry} of ${maxRetries})...`);

      // Wait for the backoff time
      await new Promise(resolve => setTimeout(resolve, backoffTime));

      // Try fetching again
      try {
        const retryResponse = await fetch(`https://api.vapi.ai/call/${data.id}`, {
          headers: {
            'Authorization': `Bearer ${Env.VAPI_PRIVATE_KEY}`,
            'Content-Type': 'application/json',
          },
          // Ensure we get fresh data
          next: {
            revalidate: 0,
          },
        });

        if (!retryResponse.ok) {
          // If retry fails, continue with the last successful data
          console.error(`Retry attempt ${currentRetry} failed, continuing with previous data`);
          continue;
        }

        callData = await retryResponse.json();

        // If we found the recording URL, break out of the loop
        if (callData.artifact?.recordingUrl) {
          console.log(`Recording found on retry attempt ${currentRetry}`);
          break;
        }
      } catch (retryError) {
        // If retry throws an error, log it but continue with the retry loop
        console.error(`Error during retry attempt ${currentRetry}:`, retryError);
        continue;
      }
    }

    // After all retries, return the data with a flag if recording isn't ready
    if (!callData.artifact?.recordingUrl && currentRetry >= maxRetries) {
      return {
        success: true,
        data: {
          ...callData,
          recordingNotReady: true,
        },
        error: `Recording not available after ${maxRetries} retry attempts`,
      };
    }

    // Return the successful data
    return { success: true, data: callData };
  } catch (error) {
    // For network or server errors, don't retry
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error fetching call details:', error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Server action to fetch a list of calls from the VAPI API
 * @param unsafeData The parameters for the request
 * @returns Promise that resolves to a list of calls with a standardized response format
 */
export async function fetchCallHistory(
  unsafeData: FetchCallHistoryParams = { limit: 10 },
): Promise<ServerActionResponse<VapiCallListResponse>> {
  try {
    // Validate input data using Zod directly
    const validationResult = fetchCallHistorySchema.safeParse(unsafeData);
    if (!validationResult.success) {
      // Format Zod errors into a readable string
      const errorMessage = validationResult.error.errors
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      return { success: false, error: errorMessage };
    }

    const data = validationResult.data;
    const limit = data.limit || 10;
    const response = await fetch(`https://api.vapi.ai/call?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${Env.VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
      // Add next.js cache options
      next: {
        revalidate: 60, // Revalidate every minute
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = `Failed to fetch call history: ${response.status} ${response.statusText}${errorData ? ` - ${JSON.stringify(errorData)}` : ''}`;
      console.error(errorMessage);
      return { success: false, error: errorMessage };
    }

    const callsData = await response.json();
    return { success: true, data: callsData };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error fetching call history:', error);
    return { success: false, error: errorMessage };
  }
}
