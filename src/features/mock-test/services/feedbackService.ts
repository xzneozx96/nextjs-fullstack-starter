import type { Message } from '../types/vapi-conversation';
import { openai } from '@/core/ai/OpenAI';
import { IELTS_FEEDBACK_PROMPT, IELTS_TRANSCRIPT_ORGANIZE_PROMPT, openaiModels } from '../constants/ai-prompts';

export type FeedbackResponse = {
  id: string;
  content: string;
  created: number;
};

export type FeedbackParams = {
  topic: string;
  part1Questions: string;
  part2Questions: string;
  part3Questions: string;
  fullTranscript: string;
  part1Transcript?: string;
  part2Transcript?: string;
  part3Transcript?: string;
};

export async function organizeTranscript(transcript: Message[]) {
  try {
    // Replace the placeholders in the prompt
    const prompt = IELTS_TRANSCRIPT_ORGANIZE_PROMPT
      .replace('{{transcript}}', JSON.stringify(transcript));

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
      return {
        part1: Array.isArray(parsedResponse.part1) ? parsedResponse.part1 : [],
        part2: Array.isArray(parsedResponse.part2) ? parsedResponse.part2 : [],
        part3: Array.isArray(parsedResponse.part3) ? parsedResponse.part3 : [],
      };
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.error('Raw response that failed to parse:', responseContent);

      // Return a default structure if parsing fails
      return {
        part1: [],
        part2: [],
        part3: [],
      };
    }
  } catch (error) {
    console.error('Error organizing transcript:', error);
    throw error;
  }
}

/**
 * Generates feedback for a speaking test based on the conversation transcript
 * @param params Parameters for generating feedback including topic and transcript parts
 * @returns A stream of feedback chunks
 */
export async function generateFeedback(params: FeedbackParams) {
  try {
    const {
      topic,
      part1Questions,
      part2Questions,
      part3Questions,
      fullTranscript,
      // part1Transcript,
      // part2Transcript,
      // part3Transcript,
    } = params;

    // Replace the placeholders in the prompt
    const prompt = IELTS_FEEDBACK_PROMPT
      .replace('{{topic}}', topic)
      .replace('{{part1Questions}}', part1Questions)
      .replace('{{part2Questions}}', part2Questions)
      .replace('{{part3Questions}}', part3Questions)
      .replace('{{fullTranscript}}', fullTranscript);
      // .replace('{{part1Transcript}}', part1Transcript)
      // .replace('{{part2Transcript}}', part2Transcript)
      // .replace('{{part3Transcript}}', part3Transcript);

    // Create a streaming response from OpenAI
    const stream = await openai.chat.completions.create({
      model: openaiModels.default,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: true,
    });

    // const stream = await openai.responses.create({
    //   model: openaiModels.reasoning,
    //   input: prompt,
    //   reasoning: {
    //     effort: 'medium',
    //   },
    //   stream: true,
    // });

    return stream;
  } catch (error) {
    console.error('Error generating feedback:', error);
    throw error;
  }
}
