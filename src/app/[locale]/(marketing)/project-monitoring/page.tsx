'use client';

// Using browser's built-in console
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import StreamingAIResponse from '@/components/StreamingAIResponse';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { generateMarketSurvey } from '@/services/marketSurveyService';
import { generateProposal } from '@/services/proposalService';
import React, { useCallback, useState } from 'react';

// Define input type for different task requirements
type TaskInputType = 'file-upload' | 'ai-prompt' | 'form' | 'document' | 'meeting' | 'code' | 'test' | 'feedback';

// Define task type
type Task = {
  id: string;
  name: string;
  description: string;
  input: string;
  inputType: TaskInputType;
  inputDetails?: string;
  inputTemplate?: string;
  output: string;
  deadline: string;
  assignee: string;
  status: 'pending' | 'in-progress' | 'completed';
};

// Define subtask type
type SubTask = {
  id: string;
  parentId: string;
  name: string;
  description: string;
  input: string;
  inputType: TaskInputType;
  inputDetails?: string;
  inputTemplate?: string;
  output: string;
  deadline: string;
  assignee: string;
  status: 'pending' | 'in-progress' | 'completed';
};

// Sample data for tasks and subtasks
const initialTasks: Task[] = [
  {
    id: '1',
    name: 'Pre-brief',
    description: 'Initial preparation phase before engaging with the client',
    input: 'Project requirements document',
    inputType: 'document',
    inputDetails: 'Initial project brief from sales team including client background, project scope, and budget constraints',
    output: 'Preliminary research report',
    deadline: '2023-06-15',
    assignee: 'Project Manager',
    status: 'in-progress',
  },
  {
    id: '2',
    name: 'Brief',
    description: 'Formal meeting with client to gather requirements',
    input: 'Preliminary research report',
    inputType: 'meeting',
    inputDetails: 'Schedule a meeting with client stakeholders to discuss project goals, timeline, and deliverables',
    output: 'Detailed project proposal',
    deadline: '2023-06-30',
    assignee: 'Project Manager',
    status: 'pending',
  },
  {
    id: '3',
    name: 'De-brief',
    description: 'Post-meeting analysis and planning',
    input: 'Meeting notes and client feedback',
    inputType: 'document',
    inputDetails: 'Compile all meeting notes, client feedback, and initial requirements into a structured document',
    output: 'Action plan',
    deadline: '2023-07-15',
    assignee: 'Project Manager',
    status: 'pending',
  },
  {
    id: '4',
    name: 'Planning',
    description: 'Detailed project planning phase',
    input: 'Action plan and project proposal',
    inputType: 'form',
    inputDetails: 'Create a detailed project plan with milestones, resource allocation, and risk assessment',
    inputTemplate: 'Project Planning Template v2.0',
    output: 'Project plan with timeline',
    deadline: '2023-07-30',
    assignee: 'Project Manager',
    status: 'pending',
  },
  {
    id: '5',
    name: 'Development',
    description: 'Main development phase of the project',
    input: 'Project plan',
    inputType: 'code',
    inputDetails: 'Development tasks based on approved project plan and technical specifications',
    output: 'Developed product/service',
    deadline: '2023-09-30',
    assignee: 'Development Team',
    status: 'pending',
  },
  {
    id: '6',
    name: 'Deployment',
    description: 'Deployment of the developed product/service',
    input: 'Developed product/service',
    inputType: 'test',
    inputDetails: 'Deployment checklist, environment configuration, and rollout plan',
    output: 'Deployed product/service',
    deadline: '2023-10-15',
    assignee: 'Operations Team',
    status: 'pending',
  },
  {
    id: '7',
    name: 'Feedback and optimization',
    description: 'Gathering feedback and making improvements',
    input: 'Deployed product/service',
    inputType: 'feedback',
    inputDetails: 'User feedback forms, analytics data, and performance metrics',
    output: 'Optimized product/service',
    deadline: '2023-11-15',
    assignee: 'Project Team',
    status: 'pending',
  },
];

// const initialSubtasks: SubTask[] = [
//   {
//     id: '1.1',
//     parentId: '1',
//     name: 'Gather information',
//     description: 'Sales and customer teams collect comprehensive information from the client through structured interviews and submit via online form',
//     input: 'Client interview questionnaire with online submission form',
//     inputType: 'form',
//     inputDetails: 'Sales and customer teams should conduct structured interviews with client stakeholders and submit their findings through the online form. Each question requires a detailed answer based on client responses.',
//     inputTemplate: 'Client_Information_Form.docx',
//     output: 'Comprehensive client business analysis document with detailed answers to the questionnaire that will serve as input for the market survey and proposal writing tasks',
//     deadline: '2023-06-10',
//     assignee: 'Sales Manager',
//     status: 'in-progress',
//   },
//   {
//     id: '1.2',
//     parentId: '1',
//     name: 'Market survey',
//     description: 'Research market landscape including competitors and open source alternatives',
//     input: 'Call an AI agent (GPT-4o or Deep Seek) to conduct market research based on a prompt template',
//     inputType: 'ai-prompt',
//     inputDetails: 'Use AI to research competitors, open source alternatives, market trends, and industry best practices related to the client\'s business domain',
//     inputTemplate: 'Conduct a comprehensive market survey for [client industry] focusing on: 1) Top 5 competitors and their strengths/weaknesses, 2) Available open source solutions that address similar problems, 3) Current market trends and future projections, 4) Industry best practices and standards. Format the response as a detailed market analysis report with visual comparisons where possible.',
//     output: 'Market analysis report generated by AI agent comparing competitors, open source alternatives, market trends, and industry best practices',
//     deadline: '2023-06-12',
//     assignee: 'Research Analyst',
//     status: 'pending',
//   },
//   {
//     id: '1.3',
//     parentId: '1',
//     name: 'Write proposal',
//     description: 'Create a comprehensive project proposal based on gathered information and market research',
//     input: 'Business analysis document and market analysis report from previous tasks',
//     inputType: 'ai-prompt',
//     inputDetails: 'Use AI to generate a comprehensive project proposal by combining insights from the business analysis and market research documents',
//     inputTemplate: 'Create a comprehensive project proposal for [client name] by synthesizing the information from the business analysis document and market research report. The proposal should include: 1) Executive Summary, 2) Problem Statement, 3) Proposed Solution with technical approach, 4) Implementation Timeline, 5) Resource Requirements, 6) Budget Estimation, 7) Expected Outcomes and KPIs, 8) Risk Assessment and Mitigation Strategies. Format as a professional proposal document ready for client presentation.',
//     output: 'Complete project proposal document generated by AI agent that synthesizes business analysis and market research into actionable recommendations',
//     deadline: '2023-06-14',
//     assignee: 'Project Manager',
//     status: 'pending',
//   },
//   {
//     id: '2.1',
//     parentId: '2',
//     name: 'Gather client\'s requirement and goal',
//     description: 'Detailed gathering of client requirements and goals',
//     input: 'Client situation analysis report',
//     inputType: 'meeting',
//     inputDetails: 'Conduct requirements gathering sessions with client stakeholders to document functional and non-functional requirements',
//     output: 'Requirements specification document',
//     deadline: '2023-06-25',
//     assignee: 'Business Analyst',
//     status: 'pending',
//   },
//   {
//     id: '2.2',
//     parentId: '2',
//     name: 'Make a detailed proposal',
//     description: 'Create a comprehensive project proposal',
//     input: 'Requirements specification document',
//     inputType: 'document',
//     inputDetails: 'Develop a detailed proposal including scope, timeline, budget, deliverables, and success criteria',
//     inputTemplate: 'Project_Proposal_Template.docx',
//     output: 'Detailed project proposal',
//     deadline: '2023-06-30',
//     assignee: 'Project Manager',
//     status: 'pending',
//   },
// ];

export default function ProjectMonitoring() {
  const [selectedTask, setSelectedTask] = useState<Task | SubTask | null>(null);
  const [clientData, setClientData] = useState({
    businessInfo: '',
    challenges: '',
    technologies: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isGeneratingSurvey, setIsGeneratingSurvey] = useState(false);
  const [surveyResult, setSurveyResult] = useState('');
  const [surveyError, setSurveyError] = useState<string | null>(null);
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [proposalResult, setProposalResult] = useState('');
  const [proposalError, setProposalError] = useState<string | null>(null);
  const [subtasks, setSubtasks] = useState<SubTask[]>([
    {
      id: '1.1',
      parentId: '1',
      name: 'Gather Information',
      description: 'Collect client requirements and business information',
      input: 'Client questionnaire',
      inputType: 'form',
      inputDetails: 'Fill out the client information form with business details and requirements',
      inputTemplate: 'Client_Information_Form.docx',
      output: 'Completed client information form',
      deadline: '2023-06-10',
      assignee: 'Business Analyst',
      status: 'pending',
    },
    {
      id: '1.2',
      parentId: '1',
      name: 'Market Research',
      description: 'Analyze market and competitors',
      input: 'Client business information',
      inputType: 'ai-prompt',
      inputDetails: 'Generate market research using AI based on client information',
      inputTemplate: 'Conduct a comprehensive market survey for [client industry] focusing on: '
        + '1) Top 5 competitors and their strengths/weaknesses, '
        + '2) Available open source solutions that address similar problems, '
        + '3) Current market trends and future projections, '
        + '4) Industry best practices and standards. '
        + 'Format the response as a detailed market analysis report.',
      output: 'Market analysis report generated by AI comparing competitors, solutions, and trends',
      deadline: '2023-06-12',
      assignee: 'Research Analyst',
      status: 'pending',
    },
    {
      id: '1.3',
      parentId: '1',
      name: 'Write Proposal',
      description: 'Create project proposal based on research',
      input: 'Market research results',
      inputType: 'ai-prompt',
      inputDetails: 'Generate project proposal using AI based on market research',
      inputTemplate: 'Create a comprehensive project proposal for [client name] by synthesizing the '
        + 'information from the business analysis document and market research report. The proposal should '
        + 'include: 1) Executive Summary, 2) Problem Statement, 3) Proposed Solution with technical approach, '
        + '4) Implementation Timeline, 5) Resource Requirements, 6) Budget Estimation, 7) Expected Outcomes '
        + 'and KPIs, 8) Risk Assessment and Mitigation Strategies. Format as a professional proposal document.',
      output: 'Complete project proposal document generated by AI that synthesizes business analysis and '
        + 'market research into actionable recommendations',
      deadline: '2023-06-14',
      assignee: 'Project Manager',
      status: 'pending',
    },
  ]);
  const [tasks, setTasks] = useState<Task[]>([...initialTasks]);

  // Function to update parent task status based on subtask statuses
  const updateParentTaskStatus = useCallback((updatedSubtasks: SubTask[]) => {
    // Create a copy of the tasks array
    const updatedTasks = [...tasks];

    // Group subtasks by parent ID
    const subtasksByParent: Record<string, SubTask[]> = {};
    updatedSubtasks.forEach((subtask) => {
      if (subtask.parentId) {
        if (!subtasksByParent[subtask.parentId]) {
          subtasksByParent[subtask.parentId] = [];
        }
        subtasksByParent[subtask.parentId]?.push(subtask);
      }
    });

    // Update each parent task's status based on its subtasks
    Object.keys(subtasksByParent).forEach((parentId) => {
      const parentSubtasks = subtasksByParent[parentId];
      const parentTask = updatedTasks.find(task => task.id === parentId);

      if (parentTask) {
        // If all subtasks are completed, mark parent as completed
        if (parentSubtasks?.every(subtask => subtask.status === 'completed')) {
          parentTask.status = 'completed';
        } else if (parentSubtasks?.some(subtask => subtask.status === 'in-progress')) {
          // If any subtask is in-progress, mark parent as in-progress
          parentTask.status = 'in-progress';
        } else {
          parentTask.status = 'pending';
        }
      }
    });

    // Update the tasks state
    // Note: In a real app, you would update the tasks in the database
    console.log('Updated parent task statuses:', updatedTasks);
    setTasks(updatedTasks);
  }, [tasks]);

  // Function to process streaming response for proposal
  const processProposalResponse = useCallback(async (stream: any): Promise<void> => {
    let accumulatedContent = '';

    try {
      // Process response from OpenAI streaming API
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        accumulatedContent += content;
        setProposalResult(accumulatedContent);
      }

      // Mark proposal task as completed when streaming is done
      const updatedSubtasks = [...subtasks];
      const proposalTask = updatedSubtasks.find(task => task.id === '1.3');
      if (proposalTask) {
        proposalTask.status = 'completed';
        // Update the subtasks state
        setSubtasks(updatedSubtasks);
        // Update parent task status
        updateParentTaskStatus(updatedSubtasks);
        // Keep the proposal result and don't reset any state
        console.log('Proposal generation completed successfully');
      }
    } catch (error) {
      console.error('Error processing stream:', error);
      setProposalError('Error processing response stream');
    }
  }, [subtasks, updateParentTaskStatus]);

  // Function to handle generating project proposal with AI
  const handleGenerateProposal = useCallback((marketSurveyResults: string) => {
    console.log('Generating project proposal based on market survey results');

    // Show loading state and start the generation process
    setIsGeneratingProposal(true);
    setProposalError(null);
    setProposalResult('Initializing AI proposal generation...');

    // Mark proposal task as in-progress if it's not already
    const updatedSubtasks = [...subtasks];
    const proposalTask = updatedSubtasks.find(task => task.id === '1.3');
    if (proposalTask && proposalTask.status !== 'in-progress') {
      proposalTask.status = 'in-progress';
      setSubtasks(updatedSubtasks);
    }

    // Prepare parameters for the proposal generation
    const params = {
      clientBusiness: clientData.businessInfo,
      clientIndustry: '', // Already included in businessInfo
      clientChallenges: clientData.challenges,
      clientTechnologies: clientData.technologies,
      marketSurveyResults,
    };

    // Set a timeout to prevent infinite loops
    const timeoutId = setTimeout(() => {
      setIsGeneratingProposal(false);
      setProposalError('The request is taking longer than expected. It has been cancelled to prevent excessive API usage.');
    }, 60000); // 60 seconds timeout

    // Call the proposal service
    generateProposal(params)
      .then((stream) => {
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);
        // Process the streaming response
        return processProposalResponse(stream);
      })
      .catch((error) => {
        // Clear the timeout
        clearTimeout(timeoutId);
        console.error('Error generating project proposal:', error);
        setProposalError(`Error generating project proposal: ${error.message}`);
      })
      .finally(() => {
        setIsGeneratingProposal(false);
      });
  }, [clientData, processProposalResponse, subtasks]);

  // Function to process streaming response for market survey
  const processMarketSurveyResponse = useCallback(async (stream: any): Promise<void> => {
    let accumulatedContent = '';

    try {
      // Process response from OpenAI streaming API
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        accumulatedContent += content;
        setSurveyResult(accumulatedContent);
      }
      // Mark survey as completed when streaming is done
      setSurveyCompleted(true);

      // Update task status - mark Market Survey as completed
      const updatedSubtasks = [...subtasks];
      const marketSurveyTask = updatedSubtasks.find(task => task.id === '1.2');
      if (marketSurveyTask) {
        marketSurveyTask.status = 'completed';
      }

      // Find and update the proposal task status to in-progress
      const proposalTask = updatedSubtasks.find(subtask => subtask.id === '1.3');
      if (proposalTask) {
        proposalTask.status = 'in-progress';
        // Update the subtasks state
        setSubtasks(updatedSubtasks);
        // Update parent task status
        updateParentTaskStatus(updatedSubtasks);

        // Select the Write Proposal task to redirect to step 3
        setSelectedTask(proposalTask);
        // Start generating the proposal
        handleGenerateProposal(accumulatedContent);
      }
    } catch (error) {
      console.error('Error processing stream:', error);
      setSurveyError('Error processing response stream');
    }
  }, [subtasks, handleGenerateProposal, updateParentTaskStatus]);

  // Function to handle task selection
  const handleTaskSelect = (task: Task | SubTask) => {
    console.log('Task selected:', task);
    setSelectedTask(task);
  };

  // Function to handle form submission from Gather Information task
  const handleFormSubmit = useCallback(() => {
    // Get values from form fields
    const businessInfo = (document.getElementById('core-business') as HTMLTextAreaElement)?.value || '';
    const industry = (document.getElementById('target-customers') as HTMLTextAreaElement)?.value || '';
    const challenges = (document.getElementById('business-problems') as HTMLTextAreaElement)?.value || '';
    const technologies = (document.getElementById('current-systems') as HTMLTextAreaElement)?.value || '';

    // Get additional form fields
    const marketPosition = (document.getElementById('market-position') as HTMLTextAreaElement)?.value || '';
    const differentiators = (document.getElementById('differentiators') as HTMLTextAreaElement)?.value || '';
    const organization = (document.getElementById('organization') as HTMLTextAreaElement)?.value || '';
    const painPoints = (document.getElementById('pain-points') as HTMLTextAreaElement)?.value || '';
    const previousSolutions = (document.getElementById('previous-solutions') as HTMLTextAreaElement)?.value || '';
    const legacySystems = (document.getElementById('legacy-systems') as HTMLTextAreaElement)?.value || '';
    const businessObjectives = (document.getElementById('business-objectives') as HTMLTextAreaElement)?.value || '';
    const projectAlignment = (document.getElementById('project-alignment') as HTMLTextAreaElement)?.value || '';
    const successOutcomes = (document.getElementById('success-outcomes') as HTMLTextAreaElement)?.value || '';

    // Combine business and industry information
    const combinedBusinessInfo = `${businessInfo}. Industry: ${industry}`;

    // Update client data state
    setClientData({
      businessInfo: combinedBusinessInfo,
      challenges,
      technologies,
    });

    // Mark form as submitted
    setFormSubmitted(true);

    // Update task status - mark Gather Information as completed
    const updatedSubtasks = [...subtasks];
    const gatherInfoTask = updatedSubtasks.find(task => task.id === '1.1');
    if (gatherInfoTask) {
      gatherInfoTask.status = 'completed';
      setSubtasks(updatedSubtasks);
      // Update parent task status
      updateParentTaskStatus(updatedSubtasks);
    }

    // Update task status
    // In a real application, this would be saved to a database
    console.log('Form submitted with data:', { businessInfo: combinedBusinessInfo, challenges, technologies });

    // Show success message
    console.log('Information gathered successfully! Automatically starting Market Survey generation...');

    // Find the Market Survey task (step 2) and select it to redirect
    const marketSurveyTask = updatedSubtasks.find(subtask => subtask.id === '1.2');

    if (marketSurveyTask) {
      // Update Market Survey task status to in-progress
      marketSurveyTask.status = 'in-progress';
      // Select the Market Survey task to redirect to step 2
      handleTaskSelect(marketSurveyTask);
    }

    // Automatically start the market survey generation
    setIsGeneratingSurvey(true);
    setSurveyError(null);
    setSurveyResult('Initializing AI market survey generation...');

    // Prepare parameters for the market survey
    const params = {
      clientBusiness: businessInfo,
      clientIndustry: industry,
      clientChallenges: challenges,
      clientTechnologies: technologies,
      targetCustomers: industry, // Using industry as target customers for now
      marketPosition,
      differentiators,
      organizationStructure: organization,
      painPoints,
      previousSolutions,
      legacySystems,
      businessObjectives,
      projectAlignment,
      successOutcomes,
    };

    // Set a timeout to prevent infinite loops
    const timeoutId = setTimeout(() => {
      setIsGeneratingSurvey(false);
      setSurveyError('The request is taking longer than expected. It has been cancelled to prevent excessive API usage.');
    }, 60000); // 60 seconds timeout

    // Call the market survey service
    generateMarketSurvey(params)
      .then((stream) => {
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);
        // Process the streaming response
        return processMarketSurveyResponse(stream);
      })
      .catch((error) => {
        // Clear the timeout
        clearTimeout(timeoutId);
        console.error('Error generating market survey:', error);
        setSurveyError(`Error generating market survey: ${error.message}`);
      })
      .finally(() => {
        setIsGeneratingSurvey(false);
      });
  }, [subtasks, updateParentTaskStatus, processMarketSurveyResponse]);

  // Function to handle generating market survey with AI
  const handleGenerateMarketSurvey = useCallback(() => {
    if (!formSubmitted) {
      console.log('Please complete and submit the "Gather Information" task first.');
      return;
    }

    // In a real application, this would call the marketSurveyService
    // to generate a market survey using OpenAI with web search capabilities
    console.log('Generating market survey with data:', clientData);

    // Show loading state and start the generation process
    setIsGeneratingSurvey(true);
    setSurveyError(null);
    setSurveyResult('Initializing AI market survey generation...');
  }, [formSubmitted, clientData]);

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500';
      case 'pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <PageBreadcrumb pageTitle="Project Monitoring Dashboard" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Panel - Task List */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
          <ComponentCard title="Project Tasks">
            <div className="overflow-hidden rounded-xl bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  {/* Table Header */}
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-start text-theme-xs"
                      >
                        Task
                      </TableCell>

                    </TableRow>
                  </TableHeader>

                  {/* Table Body */}
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {tasks.map(task => (
                      <React.Fragment key={task.id}>
                        <TableRow
                          onClick={() => handleTaskSelect(task)}
                          className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedTask?.id === task.id ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
                        >
                          <TableCell className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                {task.id}
                                .
                                {task.name}
                              </div>
                              {task.status === 'in-progress'
                                ? (
                                    <div className="flex items-center">
                                      <svg className="animate-spin h-3 w-3 text-blue-500 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      <span className="inline-block w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
                                    </div>
                                  )
                                : (
                                    <span className={`inline-block w-3 h-3 rounded-full ${task.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                  )}
                            </div>
                          </TableCell>

                        </TableRow>

                        {/* Render subtasks */}
                        {subtasks
                          .filter(subtask => subtask.parentId === task.id)
                          .map(subtask => (
                            <TableRow
                              key={subtask.id}
                              onClick={() => handleTaskSelect(subtask)}
                              className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedTask?.id === subtask.id ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
                            >
                              <TableCell className="px-5 py-4 text-start pl-10 text-gray-800 dark:text-white/90">
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2">
                                    {subtask.id}
                                    {' '}
                                    {subtask.name}
                                  </div>
                                  {subtask.status === 'in-progress'
                                    ? (
                                        <div className="flex items-center">
                                          <svg className="animate-spin h-3 w-3 text-blue-500 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                          </svg>
                                          <span className="inline-block w-3 h-3 rounded-full bg-blue-500 animate-pulse "></span>
                                        </div>
                                      )
                                    : (
                                        <span className={`inline-block w-3 h-3 rounded-full ${subtask.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                      )}
                                </div>
                              </TableCell>

                            </TableRow>
                          ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </ComponentCard>
        </div>

        {/* Right Panel - Task Details */}
        <div className="lg:col-span-7">
          <ComponentCard title="Task Details">
            {selectedTask
              ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-medium text-gray-800 dark:text-white/90">
                        {selectedTask.id}
                        {' '}
                        {selectedTask.name}
                      </h3>
                      <p className="mt-2 text-gray-500 dark:text-gray-400">
                        {selectedTask.description}
                      </p>
                    </div>

                    {/* Task Metadata */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                        <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Deadline</h4>
                        <p className="text-gray-600 dark:text-gray-400">{selectedTask.deadline}</p>
                      </div>

                      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                        <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Assignee</h4>
                        <p className="text-gray-600 dark:text-gray-400">{selectedTask.assignee}</p>
                      </div>

                      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                        <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Status</h4>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedTask.status)}`}>
                          {selectedTask.status.charAt(0).toUpperCase() + selectedTask.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Task Input Requirements */}
                    <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-700">
                      <h4 className="mb-3 text-lg font-medium text-gray-800 dark:text-white/90">Input Requirements</h4>

                      <div className="mb-4">
                        <h5 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Input Type</h5>
                        <div className="flex items-center">
                          <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-md dark:bg-blue-900/30 dark:text-blue-500">
                            {selectedTask.inputType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h5 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Description</h5>
                        <p className="text-gray-600 dark:text-gray-400">{selectedTask.inputDetails}</p>
                      </div>

                      {/* Interactive elements based on input type */}
                      {selectedTask.inputType === 'file-upload' && (
                        <div className="mt-4">
                          <h5 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Upload File</h5>
                          <div className="flex items-center justify-center w-full">
                            <label
                              htmlFor="dropzone-file"
                              aria-label="Upload file dropzone"
                              className="
                                flex flex-col items-center justify-center w-full h-32
                                border-2 border-gray-300 border-dashed rounded-lg cursor-pointer
                                bg-gray-50 hover:bg-gray-100 dark:bg-gray-700
                                dark:hover:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-500
                              "
                            >
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                </svg>
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                  <span className="font-semibold">Click to upload</span>
                                  {' '}
                                  or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{selectedTask.inputTemplate ? `Template: ${selectedTask.inputTemplate}` : 'Any file format accepted'}</p>
                              </div>
                              <input id="dropzone-file" type="file" className="hidden" />
                            </label>
                          </div>
                        </div>
                      )}

                      {selectedTask.inputType === 'ai-prompt' && (
                        <div className="mt-4">
                          <h5 className="mb-2 font-medium text-gray-700 dark:text-gray-300">AI Prompt Template</h5>
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedTask.inputTemplate}</p>
                          </div>

                          {selectedTask.id === '1.2'
                            ? (
                                <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
                                  <h6 className="mb-3 font-medium text-gray-700 dark:text-gray-300">
                                    Generate Market Survey with AI
                                  </h6>
                                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                                    Use the information gathered from the client to generate a comprehensive market survey report.
                                  </p>

                                  {!formSubmitted && (
                                    <div
                                      className={`
                                        p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800
                                        dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-500
                                      `}
                                    >
                                      <p className="text-sm">
                                        Please complete and submit the "Gather Information" task first to generate a market survey.
                                      </p>
                                    </div>
                                  )}

                                  {/* Market Survey Results */}
                                  <div className="mt-6">
                                    <StreamingAIResponse
                                      content={surveyResult}
                                      isLoading={isGeneratingSurvey}
                                      error={surveyError}
                                      title="AI Market Survey Results"
                                      height="600px"
                                    />
                                  </div>

                                  {formSubmitted && (
                                    <div className="mt-6 flex space-x-3">
                                      <button
                                        type="button"
                                        className={`
                                          px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                                        `}
                                        onClick={handleGenerateMarketSurvey}
                                        disabled={isGeneratingSurvey}
                                      >
                                        {isGeneratingSurvey ? 'Generating Market Survey...' : 'Regenerate Market Survey'}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )
                            : selectedTask.id === '1.3'
                              ? (
                                  <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
                                    <h6 className="mb-3 font-medium text-gray-700 dark:text-gray-300">Generate Project Proposal with AI</h6>
                                    <p className="mb-4 text-gray-600 dark:text-gray-400">Create a comprehensive project proposal based on the client information and market survey results.</p>

                                    {!surveyCompleted && (
                                      <div className="p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-500">
                                        <p className="text-sm">Please complete the "Market Survey" task first to generate a project proposal.</p>
                                      </div>
                                    )}

                                    {/* Proposal Results */}
                                    <div className="mt-6">
                                      <StreamingAIResponse
                                        content={proposalResult}
                                        isLoading={isGeneratingProposal}
                                        error={proposalError}
                                        title="AI Project Proposal"
                                        height="600px"
                                      />
                                    </div>
                                  </div>
                                )
                              : (
                                  <div className="mt-4">
                                    <h5 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Enter Your Prompt</h5>
                                    <textarea
                                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                      rows={4}
                                      placeholder="Customize the prompt template and enter your specific requirements here..."
                                    >
                                    </textarea>
                                    <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                                      Generate with AI
                                    </button>
                                  </div>
                                )}
                        </div>
                      )}

                      {selectedTask.inputType === 'form' && (
                        <div className="mt-4">
                          <h5 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Client Information Form</h5>

                          <div className="space-y-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                            {/* Business Overview Section */}
                            <div>
                              <h6 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Business Overview</h6>
                              <div className="space-y-4">
                                <div>
                                  <label htmlFor="core-business" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">1. What is the client's core business and primary industry?</label>
                                  <textarea
                                    id="core-business"
                                    rows={2}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Enter client's response..."
                                    defaultValue="The client operates in the retail and e-commerce industry, specializing in health and wellness products such as supplements, skincare, and organic food items."
                                  >
                                  </textarea>
                                </div>
                                <div>
                                  <label htmlFor="target-customers" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">2. Who are their target customers/market segments?</label>
                                  <textarea
                                    id="target-customers"
                                    rows={2}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Enter client's response..."
                                    defaultValue="Their primary target customers are health-conscious individuals aged 25–45, predominantly urban dwellers with mid-to-high disposable income. They also cater to fitness enthusiasts and individuals seeking natural or organic lifestyle alternatives."
                                  >
                                  </textarea>
                                </div>
                                <div>
                                  <label htmlFor="market-position" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">3. What is their current market position relative to competitors?</label>
                                  <textarea
                                    id="market-position"
                                    rows={2}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Enter client's response..."
                                    defaultValue="The client holds a mid-level market position but is growing rapidly due to a strong online presence and customer loyalty. They are aiming to become a top-three player in the wellness segment within the next two years."
                                  >
                                  </textarea>
                                </div>
                                <div>
                                  <label htmlFor="differentiators" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">4. What are their key differentiators in the market?</label>
                                  <textarea
                                    id="differentiators"
                                    rows={2}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Enter client's response..."
                                    defaultValue="Their unique selling points include ethically sourced ingredients, sustainable packaging, and personalized customer experiences via a loyalty app. They also offer free health consultations via WhatsApp."
                                  >
                                  </textarea>
                                </div>
                                <div>
                                  <label htmlFor="organization" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">5. How is their organization structured?</label>
                                  <textarea
                                    id="organization"
                                    rows={2}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Enter client's response..."
                                    defaultValue="The organization follows a flat hierarchy with a small executive team overseeing departments such as marketing, logistics, product development, and customer service. They also work with external digital agencies and fulfillment partners."
                                  >
                                  </textarea>
                                </div>
                              </div>
                            </div>

                            {/* Current Challenges Section */}
                            <div>
                              <h6 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Current Challenges</h6>
                              <div className="space-y-4">
                                <div>
                                  <label htmlFor="business-problems" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">1. What specific business problems are they trying to solve?</label>
                                  <textarea
                                    id="business-problems"
                                    rows={2}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Enter client's response..."
                                    defaultValue="They are struggling with managing customer conversations across multiple channels like WhatsApp, Instagram, and their website. They also want to reduce cart abandonment and improve conversion rates."
                                  >
                                  </textarea>
                                </div>
                                <div>
                                  <label htmlFor="pain-points" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">2. What are their biggest pain points in current operations?</label>
                                  <textarea
                                    id="pain-points"
                                    rows={2}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Enter client's response..."
                                    defaultValue="Their biggest pain points include fragmented customer data across multiple platforms, manual order processing that leads to errors, and difficulty maintaining consistent inventory levels between online and physical stores."
                                  >
                                  </textarea>
                                </div>
                                <div>
                                  <label htmlFor="previous-solutions" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">3. What previous solutions have they tried?</label>
                                  <textarea
                                    id="previous-solutions"
                                    rows={2}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Enter client's response..."
                                    defaultValue="They previously tried using Zendesk for customer service and a separate CRM system, but found the lack of integration between systems created data silos. They also attempted to build a custom solution in-house but lacked the technical expertise to complete it."
                                  >
                                  </textarea>
                                </div>
                              </div>
                            </div>

                            {/* Technical Environment Section */}
                            <div>
                              <h6 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Technical Environment</h6>
                              <div className="space-y-4">
                                <div>
                                  <label htmlFor="current-systems" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">1. What systems and technologies are currently in use?</label>
                                  <textarea
                                    id="current-systems"
                                    rows={2}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Enter client's response..."
                                    defaultValue="Their tech stack includes Shopify for e-commerce, Mailchimp for email campaigns, and standalone apps for WhatsApp Business and Instagram DMs. The backend is powered by Node.js and MongoDB."
                                  >
                                  </textarea>
                                </div>
                                <div>
                                  <label htmlFor="legacy-systems" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">2. Are there any legacy systems that need integration?</label>
                                  <textarea
                                    id="legacy-systems"
                                    rows={2}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Enter client's response..."
                                    defaultValue="They have an older inventory management system built on PHP/MySQL that needs to be integrated. They also have customer data in an Excel-based system that will need to be migrated to the new solution."
                                  >
                                  </textarea>
                                </div>
                              </div>
                            </div>

                            {/* Strategic Goals Section */}
                            <div>
                              <h6 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Strategic Goals</h6>
                              <div className="space-y-4">
                                <div>
                                  <label htmlFor="business-objectives" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">1. What are their short-term and long-term business objectives?</label>
                                  <textarea
                                    id="business-objectives"
                                    rows={2}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Enter client's response..."
                                    defaultValue="Short-term: Increase online conversion rates by 15% and reduce customer service response time by 30%. Long-term: Expand to international markets and achieve 25% year-over-year growth for the next three years."
                                  >
                                  </textarea>
                                </div>
                                <div>
                                  <label htmlFor="project-alignment" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">2. How does this project align with their overall business strategy?</label>
                                  <textarea
                                    id="project-alignment"
                                    rows={2}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Enter client's response..."
                                    defaultValue="This project directly supports their digital transformation initiative and customer experience enhancement goals. By integrating communication channels and improving the e-commerce experience, it addresses key strategic priorities in their 5-year growth plan."
                                  >
                                  </textarea>
                                </div>
                                <div>
                                  <label htmlFor="success-outcomes" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">3. What specific outcomes would make this project successful?</label>
                                  <textarea
                                    id="success-outcomes"
                                    rows={2}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Enter client's response..."
                                    defaultValue="Success metrics include: 20% reduction in cart abandonment rate, 30% faster customer service response times, 15% increase in repeat purchases, and a unified customer view across all communication channels."
                                  >
                                  </textarea>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex space-x-3">
                            <button
                              type="button"
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                              onClick={handleFormSubmit}
                            >
                              Submit Form
                            </button>
                            <button
                              type="button"
                              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                            >
                              Save Draft
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedTask.inputType === 'meeting' && (
                        <div className="mt-4">
                          <h5 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Schedule Meeting</h5>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                              <label
                                htmlFor="meeting-date"
                                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                Date
                              </label>
                              <input type="date" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                            <div>
                              <label
                                htmlFor="meeting-time"
                                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                Time
                              </label>
                              <input type="time" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                          </div>
                          <div className="mt-4">
                            <label
                              htmlFor="meeting-participants"
                              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              Participants
                            </label>
                            <input
                              type="text"
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              placeholder="Enter email addresses separated by commas"
                            />
                          </div>
                          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                            Schedule Meeting
                          </button>
                        </div>
                      )}

                      {selectedTask.inputType === 'document' && (
                        <div className="mt-4">
                          <h5 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Document Requirements</h5>
                          <div className="flex flex-col space-y-4">
                            <div className="flex items-center">
                              <input id="document-checkbox-1" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                              <label htmlFor="document-checkbox-1" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Include executive summary</label>
                            </div>
                            <div className="flex items-center">
                              <input id="document-checkbox-2" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                              <label htmlFor="document-checkbox-2" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Include technical specifications</label>
                            </div>
                            <div className="flex items-center">
                              <input id="document-checkbox-3" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                              <label htmlFor="document-checkbox-3" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Include budget breakdown</label>
                            </div>
                          </div>
                          {selectedTask.inputTemplate && (
                            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                              Download Template
                            </button>
                          )}
                        </div>
                      )}

                      {selectedTask.inputType === 'code' && (
                        <div className="mt-4">
                          <h5 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Development Tasks</h5>
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                            <ul className="space-y-2">
                              <li className="flex items-center">
                                <input id="code-task-1" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                <label htmlFor="code-task-1" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Set up development environment</label>
                              </li>
                              <li className="flex items-center">
                                <input id="code-task-2" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                <label htmlFor="code-task-2" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Implement core functionality</label>
                              </li>
                              <li className="flex items-center">
                                <input id="code-task-3" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                <label htmlFor="code-task-3" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Write unit tests</label>
                              </li>
                              <li className="flex items-center">
                                <input id="code-task-4" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                <label htmlFor="code-task-4" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Code review</label>
                              </li>
                            </ul>
                          </div>
                          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                            View Repository
                          </button>
                        </div>
                      )}

                      {selectedTask.inputType === 'test' && (
                        <div className="mt-4">
                          <h5 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Deployment Checklist</h5>
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                            <ul className="space-y-2">
                              <li className="flex items-center">
                                <input id="test-task-1" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                <label htmlFor="test-task-1" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Environment configuration</label>
                              </li>
                              <li className="flex items-center">
                                <input id="test-task-2" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                <label htmlFor="test-task-2" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Integration testing</label>
                              </li>
                              <li className="flex items-center">
                                <input id="test-task-3" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                <label htmlFor="test-task-3" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Performance testing</label>
                              </li>
                              <li className="flex items-center">
                                <input id="test-task-4" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                <label htmlFor="test-task-4" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Security audit</label>
                              </li>
                              <li className="flex items-center">
                                <input id="test-task-5" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                <label htmlFor="test-task-5" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Backup and rollback plan</label>
                              </li>
                            </ul>
                          </div>
                          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                            Run Tests
                          </button>
                        </div>
                      )}

                      {selectedTask.inputType === 'feedback' && (
                        <div className="mt-4">
                          <h5 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Feedback Collection</h5>
                          <div className="mb-4">
                            <label
                              htmlFor="survey-type"
                              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              Feedback Source
                            </label>
                            <select id="survey-type" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                              <option>User Surveys</option>
                              <option>Analytics Data</option>
                              <option>Client Interviews</option>
                              <option>Support Tickets</option>
                              <option>Social Media</option>
                            </select>
                          </div>
                          <div className="mb-4">
                            <label
                              htmlFor="feedback-summary"
                              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              Feedback Summary
                            </label>
                            <textarea
                              id="feedback-summary"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              rows={4}
                              placeholder="Enter a summary of the feedback collected..."
                            >
                            </textarea>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                            Generate Feedback Report
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Expected Output */}
                    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                      <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Expected Output</h4>
                      <p className="text-gray-600 dark:text-gray-400">{selectedTask.output}</p>
                    </div>
                  </div>
                )
              : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500 dark:text-gray-400">Select a task to view details</p>
                  </div>
                )}
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
