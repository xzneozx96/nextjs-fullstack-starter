import { openRouter } from '@/core/ai/OpenRouter';

export type MarketSurveyParams = {
  model: string;
  clientBusiness: string;
  clientIndustry: string;
  clientChallenges: string;
  clientTechnologies: string;
  targetCustomers: string;
  marketPosition: string;
  differentiators: string;
  organizationStructure: string;
  painPoints: string;
  previousSolutions: string;
  legacySystems: string;
  businessObjectives: string;
  projectAlignment: string;
  successOutcomes: string;
};

const MARKET_SURVEY_PROMPT = `
You are a professional market research analyst with expertise in competitive analysis and technology trends.
Your task is to conduct a comprehensive market survey based on the client information provided.

CLIENT INFORMATION:
- Business and Industry: {clientBusiness}
- Target Customers: {targetCustomers}
- Market Position: {marketPosition}
- Key Differentiators: {differentiators}
- Organization Structure: {organizationStructure}

CURRENT CHALLENGES:
- Business Problems: {clientChallenges}
- Pain Points: {painPoints}
- Previous Solutions Tried: {previousSolutions}

TECHNICAL ENVIRONMENT:
- Current Technologies: {clientTechnologies}
- Legacy Systems: {legacySystems}

STRATEGIC GOALS:
- Business Objectives: {businessObjectives}
- Project Alignment: {projectAlignment}
- Success Outcomes: {successOutcomes}

Please conduct a thorough market survey that includes:

1. COMPETITOR ANALYSIS:
   - Identify the top 5 competitors in this space
   - Analyze their strengths and weaknesses
   - Evaluate their market positioning and unique selling propositions
   - Assess their product/service offerings compared to what the client needs
   - Compare how competitors address similar pain points

2. OPEN SOURCE ALTERNATIVES:
   - Identify relevant open source solutions that could address the client's challenges
   - Evaluate the maturity, community support, and limitations of each solution
   - Compare features against commercial alternatives
   - Assess integration potential with the client's existing technology stack
   - Evaluate compatibility with legacy systems

3. MARKET TRENDS:
   - Analyze current trends in the industry
   - Identify emerging technologies and methodologies
   - Forecast how these trends might impact the client's business in the next 1-3 years
   - Highlight potential opportunities and threats
   - Assess how trends align with the client's strategic goals

4. INDUSTRY BEST PRACTICES:
   - Document established best practices relevant to the client's challenges
   - Identify standards and frameworks commonly adopted in the industry
   - Suggest potential improvements to the client's current approach
   - Recommend implementation strategies that align with the client's organization structure

Format your response as a professional market analysis report with clear sections, bullet points
where appropriate, and visual comparisons when possible. Include specific examples and data points
from your research to support your analysis.
`;

/**
 * Generates a market survey report based on client information
 * @param params Parameters containing client business information
 * @returns A stream of market survey report chunks
 */
export async function generateMarketSurvey(params: MarketSurveyParams) {
  // Set a timeout to prevent infinite loops
  const TIMEOUT_MS = 30000; // 30 seconds timeout
  let timeoutId: NodeJS.Timeout | undefined;

  try {
    const {
      clientBusiness,
      clientIndustry,
      clientChallenges,
      clientTechnologies,
      targetCustomers = '',
      marketPosition = '',
      differentiators = '',
      organizationStructure = '',
      painPoints = '',
      previousSolutions = '',
      legacySystems = '',
      businessObjectives = '',
      projectAlignment = '',
      successOutcomes = '',
    } = params;

    // Combine business and industry information
    const businessInfo = `${clientBusiness}. Industry: ${clientIndustry}`;

    // Replace the placeholders in the prompt
    const prompt = MARKET_SURVEY_PROMPT
      .replace('{clientBusiness}', businessInfo)
      .replace('{targetCustomers}', targetCustomers)
      .replace('{marketPosition}', marketPosition)
      .replace('{differentiators}', differentiators)
      .replace('{organizationStructure}', organizationStructure)
      .replace('{clientChallenges}', clientChallenges)
      .replace('{painPoints}', painPoints)
      .replace('{previousSolutions}', previousSolutions)
      .replace('{clientTechnologies}', clientTechnologies)
      .replace('{legacySystems}', legacySystems)
      .replace('{businessObjectives}', businessObjectives)
      .replace('{projectAlignment}', projectAlignment)
      .replace('{successOutcomes}', successOutcomes);

    // Create a promise that will be rejected after the timeout
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('OpenRouter API request timed out after 30 seconds'));
      }, TIMEOUT_MS);
    });

    // Create a streaming response using OpenRouter
    const apiPromise = openRouter.completions.create({
      model: params.model,
      messages: [
        {
          role: 'system',
          content: 'You are a market research analyst with access to web search. Use current information '
            + 'from the web to provide accurate market analysis.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: true,
    });

    // Race between the API call and the timeout
    const stream = await Promise.race([apiPromise, timeoutPromise]) as any;

    // Clear the timeout if the API call completes before the timeout
    clearTimeout(timeoutId);

    return stream;
  } catch (error: any) {
    // Clear the timeout to prevent memory leaks
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    console.error('Error generating market survey:', error);

    // Provide more specific error information
    if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (error.status >= 500) {
      throw new Error('OpenRouter server error. Please try again later.');
    } else if (error.message.includes('timed out')) {
      throw new Error('Request timed out. Please try with a simpler query.');
    } else {
      throw new Error(`Failed to generate market survey: ${error.message || 'Unknown error'}`);
    }
  }
}
