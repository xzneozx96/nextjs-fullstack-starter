// Define input type for different task requirements
export type TaskInputType = 'file-upload' | 'ai-prompt' | 'form' | 'document' | 'meeting' | 'code' | 'test' | 'feedback' | 'text' | 'staff-selection' | 'date-time';

// Define task status type
export type TaskStatus = 'pending' | 'in-progress' | 'completed';

// Define task type
export type Task = {
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
  status: TaskStatus;
};

// Define subtask type
export type SubTask = {
  parentId: string;
} & Task;

// Form data interfaces for each task
export type AssembleTeamFormData = {
  projectDescription: string;
  selectedStaff: string[];
};

export type PreliminaryResearchFormData = {
  clientName: string;
  clientDomain: string;
  clientLocation: string;
  promptTemplate: string;
  researchResult: string;
  isApproved: boolean;
};

export type MeetingObjectivesFormData = {
  meetingGoals: string;
};

export type ClientQuestionnaireFormData = {
  selectedStaff: string[];
  deadline: string;
  promptTemplate: string;
  questionnaireResult: string;
  isApproved: boolean;
};

export type PresentationDeckFormData = {
  selectedStaff: string[];
  deadline: string;
  file: string | null;
};

export type DraftProposalFormData = {
  promptTemplate: string;
  clientName: string;
  goal: string;
  proposalLocation: string;
  proposalTime: string;
  proposalResult: string;
  isApproved: boolean;
};

// Client data for the form (legacy - keeping for compatibility)
export type ClientData = {
  businessInfo: string;
  challenges: string;
  technologies: string;
};

// Market survey parameters (legacy - keeping for compatibility)
export type MarketSurveyFormData = {
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
} & ClientData;
