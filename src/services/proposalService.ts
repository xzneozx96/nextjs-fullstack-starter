import { openRouter } from '@/libs/OpenRouter';

export type ProposalParams = {
  model: string;
  clientBusiness: string;
  clientIndustry: string;
  clientChallenges: string;
  clientTechnologies: string;
  marketSurveyResults: string;
  targetCustomers?: string;
  marketPosition?: string;
  differentiators?: string;
  organizationStructure?: string;
  painPoints?: string;
  previousSolutions?: string;
  legacySystems?: string;
  businessObjectives?: string;
  projectAlignment?: string;
  successOutcomes?: string;
};

const PROPOSAL_PROMPT = `
You are a professional business consultant with expertise in creating comprehensive project proposals.
Your task is to create a detailed project proposal based on the client information and market survey results provided.

CLIENT INFORMATION:
- Business and Industry: {clientBusiness}
- Target Customers: {targetCustomers}
- Current Challenges: {clientChallenges}
- Current Technologies: {clientTechnologies}
- Market Position: {marketPosition}
- Key Differentiators: {differentiators}
- Organization Structure: {organizationStructure}
- Pain Points: {painPoints}
- Previous Solutions Tried: {previousSolutions}
- Legacy Systems: {legacySystems}
- Business Objectives: {businessObjectives}
- Project Alignment: {projectAlignment}
- Success Outcomes: {successOutcomes}

MARKET SURVEY RESULTS:
{marketSurveyResults}

Based on the client information and market survey results, please create a comprehensive project proposal that includes:

1. EXECUTIVE SUMMARY:
   - Brief overview of the client's business and challenges
   - Summary of the proposed solution
   - Key benefits and expected outcomes
   - High-level timeline and budget considerations

2. PROBLEM STATEMENT:
   - Detailed analysis of the client's current challenges
   - Impact of these challenges on their business operations
   - Opportunities for improvement
   - Risks of not addressing these challenges

3. PROPOSED SOLUTION:
   - Detailed description of the recommended solution
   - Technical approach and architecture
   - Integration with existing systems
   - Implementation methodology
   - Technology stack recommendations
   - Custom development vs. off-the-shelf components

4. IMPLEMENTATION PLAN:
   - Project phases and milestones
   - Detailed timeline with key deliverables
   - Resource requirements and team structure
   - Roles and responsibilities
   - Communication and reporting plan

5. BUDGET ESTIMATION:
   - Detailed cost breakdown by phase and component
   - Licensing costs (if applicable)
   - Ongoing maintenance and support costs
   - Return on investment analysis

6. EXPECTED OUTCOMES:
   - Key performance indicators
   - Success metrics aligned with client's business objectives
   - Long-term benefits and strategic advantages
   - Potential for future expansion or enhancements

7. RISK ASSESSMENT AND MITIGATION:
   - Potential risks and challenges
   - Mitigation strategies for each identified risk
   - Contingency plans
   - Quality assurance approach

Format your response as a professional project proposal with clear sections, bullet points
where appropriate, and visual representations when possible. Use a formal business tone
and ensure all recommendations are practical, actionable, and aligned with the client's
specific needs and constraints.
`;

/**
 * Generates a comprehensive project proposal based on client information and market survey results
 * @param params Parameters containing client information and market survey results
 * @returns A stream of project proposal chunks
 */
export async function generateProposal(params: ProposalParams) {
  // Set a timeout to prevent infinite loops
  const TIMEOUT_MS = 45000; // 45 seconds timeout
  let timeoutId: NodeJS.Timeout | undefined;

  try {
    const {
      clientBusiness,
      clientIndustry,
      clientChallenges,
      clientTechnologies,
      marketSurveyResults,
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
    const prompt = PROPOSAL_PROMPT
      .replace('{clientBusiness}', businessInfo)
      .replace('{targetCustomers}', targetCustomers)
      .replace('{clientChallenges}', clientChallenges)
      .replace('{clientTechnologies}', clientTechnologies)
      .replace('{marketPosition}', marketPosition)
      .replace('{differentiators}', differentiators)
      .replace('{organizationStructure}', organizationStructure)
      .replace('{painPoints}', painPoints)
      .replace('{previousSolutions}', previousSolutions)
      .replace('{legacySystems}', legacySystems)
      .replace('{businessObjectives}', businessObjectives)
      .replace('{projectAlignment}', projectAlignment)
      .replace('{successOutcomes}', successOutcomes)
      .replace('{marketSurveyResults}', marketSurveyResults);

    // Create a promise that will be rejected after the timeout
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('OpenRouter API request timed out after 45 seconds'));
      }, TIMEOUT_MS);
    });

    // Create a streaming response using OpenRouter
    const apiPromise = openRouter.completions.create({
      model: params.model,
      messages: [
        {
          role: 'system',
          content: 'You are a professional business consultant specializing in creating detailed project proposals. '
            + 'Your proposals are comprehensive, practical, and tailored to the specific needs of each client.',
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

    console.error('Error generating project proposal:', error);

    // Provide more specific error information
    if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (error.status >= 500) {
      throw new Error('OpenRouter server error. Please try again later.');
    } else if (error.message.includes('timed out')) {
      throw new Error('Request timed out. Please try with a simpler query.');
    } else {
      throw new Error(`Failed to generate project proposal: ${error.message || 'Unknown error'}`);
    }
  }
}
