'use server';

import type { ServerActionResponse } from '@/shared/types/global';
import type { GenerateFeedbackParams, OrganizeTranscriptParams, OrganizeTranscriptResponse } from './feedback-actions.validation';
import { openai } from '@/core/ai/OpenAI';
import { IELTS_TRANSCRIPT_ORGANIZE_PROMPT, openaiModels } from '../../constants/ai-prompts';
import { generateFeedbackSchema, organizeTranscriptSchema } from './feedback-actions.validation';

/**
 * Server action to organize a transcript into parts
 * @param unsafeData The parameters for organizing the transcript
 * @returns Promise that resolves to the organized transcript with a standardized response format
 */
export async function organizeTranscriptAction(
  unsafeData: OrganizeTranscriptParams,
): Promise<ServerActionResponse<OrganizeTranscriptResponse>> {
  try {
    // Validate input data using Zod
    const validationResult = organizeTranscriptSchema.safeParse(unsafeData);
    if (!validationResult.success) {
      // Format Zod errors into a readable string
      const errorMessage = validationResult.error.errors
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      return { success: false, error: errorMessage };
    }

    const data = validationResult.data;

    // Replace the placeholders in the prompt
    const prompt = IELTS_TRANSCRIPT_ORGANIZE_PROMPT
      .replace('{{transcript}}', JSON.stringify(data.transcript));

    const result = await openai.chat.completions.create({
      model: openaiModels.default,
      response_format: {
        type: 'json_object',
      },
      messages: [
        {
          role: 'system',
          content: `You must give your answer in valid JSON format exactly like this schema:
          {
            "part1": [], // array of messages for part 1
            "part2": [], // array of messages for part 2
            "part3": []  // array of messages for part 3
          }

          Each part should contain an array of messages from the transcript that belong to
          that part of the IELTS speaking test.
          Do not include any explanations or text outside of the JSON structure.
          Ensure the response is a properly formatted JSON object that can be parsed with JSON.parse().`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Parse the JSON string into an actual JavaScript object
    const responseContent = result.choices[0]?.message.content || '{}';
    try {
      // Log the raw response for debugging
      console.log('Raw AI response:', responseContent);

      const parsedResponse = JSON.parse(responseContent);

      // Validate the response structure
      if (!parsedResponse.part1 || !parsedResponse.part2 || !parsedResponse.part3) {
        console.warn('AI response missing required parts:', parsedResponse);
      }

      // Return with fallbacks for each part
      const organizedTranscript = {
        part1: Array.isArray(parsedResponse.part1) ? parsedResponse.part1 : [],
        part2: Array.isArray(parsedResponse.part2) ? parsedResponse.part2 : [],
        part3: Array.isArray(parsedResponse.part3) ? parsedResponse.part3 : [],
      };

      return { success: true, data: organizedTranscript };
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.error('Raw response that failed to parse:', responseContent);

      // Return a default structure if parsing fails
      return {
        success: false,
        error: 'Failed to parse AI response',
        data: {
          part1: [],
          part2: [],
          part3: [],
        },
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error organizing transcript:', error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Server action to generate feedback for a speaking test
 * This function validates the input and returns the parameters to be used by the client
 * for making a request to the streaming API endpoint
 *
 * @param unsafeData The parameters for generating feedback
 * @returns Promise that resolves to a validated parameters object or an error
 */
export async function generateFeedbackAction(
  unsafeData: GenerateFeedbackParams,
): Promise<{ validatedParams?: GenerateFeedbackParams; error?: string }> {
  try {
    // Validate input data using Zod
    const validationResult = generateFeedbackSchema.safeParse(unsafeData);
    if (!validationResult.success) {
      // Format Zod errors into a readable string
      const errorMessage = validationResult.error.errors
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join(', ');

      return { error: errorMessage };
    }

    // Return the validated parameters to be used by the client
    return { validatedParams: validationResult.data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error validating feedback parameters:', error);
    return { error: errorMessage };
  }
}
