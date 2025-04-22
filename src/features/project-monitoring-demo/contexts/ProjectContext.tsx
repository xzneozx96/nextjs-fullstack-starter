import type { ReactNode } from 'react';
import type {
  AssembleTeamFormData,
  ClientData,
  ClientQuestionnaireFormData,
  DraftProposalFormData,
  MeetingObjectivesFormData,
  PreliminaryResearchFormData,
  PresentationDeckFormData,
  SubTask,
  Task,
  TaskStatus,
} from '../types/project-monitoring';
import { initialSubtasks, initialTasks } from '@/features/project-monitoring-demo/constants/project-monitoring-data';
import React, { createContext, use, useCallback, useMemo, useState } from 'react';

type ProjectContextType = {
  // Task state
  tasks: Task[];
  subtasks: SubTask[];
  selectedTask: Task | SubTask | null;
  setSelectedTask: (task: Task | SubTask | null) => void;
  handleTaskSelect: (task: Task | SubTask) => void;

  // Form data for each task
  assembleTeamFormData: AssembleTeamFormData;
  setAssembleTeamFormData: (data: Partial<AssembleTeamFormData>) => void;

  preliminaryResearchFormData: PreliminaryResearchFormData;
  setPreliminaryResearchFormData: (data: Partial<PreliminaryResearchFormData>) => void;

  meetingObjectivesFormData: MeetingObjectivesFormData;
  setMeetingObjectivesFormData: (data: Partial<MeetingObjectivesFormData>) => void;

  clientQuestionnaireFormData: ClientQuestionnaireFormData;
  setClientQuestionnaireFormData: (data: Partial<ClientQuestionnaireFormData>) => void;

  presentationDeckFormData: PresentationDeckFormData;
  setPresentationDeckFormData: (data: Partial<PresentationDeckFormData>) => void;

  draftProposalFormData: DraftProposalFormData;
  setDraftProposalFormData: (data: Partial<DraftProposalFormData>) => void;

  // Legacy state (keeping for compatibility)
  clientData: ClientData;
  setClientData: (data: ClientData) => void;
  formSubmitted: boolean;
  setFormSubmitted: (submitted: boolean) => void;
  isGeneratingSurvey: boolean;
  setIsGeneratingSurvey: (generating: boolean) => void;
  surveyResult: string;
  setSurveyResult: (result: string) => void;
  surveyError: string | null;
  setSurveyError: (error: string | null) => void;
  surveyCompleted: boolean;
  setSurveyCompleted: (completed: boolean) => void;
  isGeneratingProposal: boolean;
  setIsGeneratingProposal: (generating: boolean) => void;
  proposalResult: string;
  setProposalResult: (result: string) => void;
  proposalError: string | null;
  setProposalError: (error: string | null) => void;

  // AI model selection
  selectedModel: string;
  setSelectedModel: (model: string) => void;

  // Task management functions
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateSubtaskStatus: (subtaskId: string, status: TaskStatus) => void;
  updateParentTaskStatus: () => void;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Task state
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [subtasks, setSubtasks] = useState<SubTask[]>(initialSubtasks);
  const [selectedTask, setSelectedTask] = useState<Task | SubTask | null>(null);

  // Form data for each task
  const [assembleTeamFormData, setAssembleTeamFormDataState] = useState<AssembleTeamFormData>({
    projectDescription: '',
    selectedStaff: [],
  });

  const [preliminaryResearchFormData, setPreliminaryResearchFormDataState] = useState<PreliminaryResearchFormData>({
    clientName: '',
    clientDomain: '',
    clientLocation: '',
    promptTemplate: 'Our client is {client\'s name}, working in {client\'s domain} and located in {client\'s location}. Perform preliminary research on the current market landscape, potential competitors, and conduct a SWOT analysis.',
    researchResult: '',
    isApproved: false,
  });

  const [meetingObjectivesFormData, setMeetingObjectivesFormDataState] = useState<MeetingObjectivesFormData>({
    meetingGoals: '',
  });

  const [clientQuestionnaireFormData, setClientQuestionnaireFormDataState] = useState<ClientQuestionnaireFormData>({
    selectedStaff: [],
    deadline: '',
    promptTemplate: 'Generate a comprehensive questionnaire for our client meeting that covers business goals, technical requirements, budget constraints, timeline expectations, and key stakeholders.',
    questionnaireResult: '',
    isApproved: false,
  });

  const [presentationDeckFormData, setPresentationDeckFormDataState] = useState<PresentationDeckFormData>({
    selectedStaff: [],
    deadline: '',
    file: null,
  });

  const [draftProposalFormData, setDraftProposalFormDataState] = useState<DraftProposalFormData>({
    promptTemplate: 'Generate a draft proposal to complete the {goal}, including an implementation roadmap tailored for {client\'s name}.',
    clientName: '',
    goal: '',
    proposalLocation: '',
    proposalTime: '',
    proposalResult: '',
    isApproved: false,
  });

  // Partial update functions for form data
  const setAssembleTeamFormData = useCallback((data: Partial<AssembleTeamFormData>) => {
    setAssembleTeamFormDataState(prev => ({ ...prev, ...data }));
  }, []);

  const setPreliminaryResearchFormData = useCallback((data: Partial<PreliminaryResearchFormData>) => {
    setPreliminaryResearchFormDataState(prev => ({ ...prev, ...data }));
  }, []);

  const setMeetingObjectivesFormData = useCallback((data: Partial<MeetingObjectivesFormData>) => {
    setMeetingObjectivesFormDataState(prev => ({ ...prev, ...data }));
  }, []);

  const setClientQuestionnaireFormData = useCallback((data: Partial<ClientQuestionnaireFormData>) => {
    setClientQuestionnaireFormDataState(prev => ({ ...prev, ...data }));
  }, []);

  const setPresentationDeckFormData = useCallback((data: Partial<PresentationDeckFormData>) => {
    setPresentationDeckFormDataState(prev => ({ ...prev, ...data }));
  }, []);

  const setDraftProposalFormData = useCallback((data: Partial<DraftProposalFormData>) => {
    setDraftProposalFormDataState(prev => ({ ...prev, ...data }));
  }, []);

  // Legacy state (keeping for compatibility)
  const [clientData, setClientData] = useState<ClientData>({
    businessInfo: '',
    challenges: '',
    technologies: '',
  });

  // Form state
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Market survey state
  const [isGeneratingSurvey, setIsGeneratingSurvey] = useState(false);
  const [surveyResult, setSurveyResult] = useState('');
  const [surveyError, setSurveyError] = useState<string | null>(null);
  const [surveyCompleted, setSurveyCompleted] = useState(false);

  // Proposal state
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [proposalResult, setProposalResult] = useState('');
  const [proposalError, setProposalError] = useState<string | null>(null);

  // AI model selection state
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o-mini');

  // Update task status
  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status } : task,
      ),
    );
  }, []);

  // Handle task selection
  const handleTaskSelect = useCallback((task: Task | SubTask) => {
    console.log('Task selected:', task);
    setSelectedTask(task);
  }, []);

  // Update parent task status based on subtask statuses
  const updateParentTaskStatus = useCallback(() => {
    console.log('Updating parent task status...');

    // Get the latest subtasks state
    const currentSubtasks = [...subtasks];
    console.log('Current subtasks:', currentSubtasks);

    // Group subtasks by parent ID
    const subtasksByParent: Record<string, SubTask[]> = {};
    currentSubtasks.forEach((subtask) => {
      if (subtask.parentId) {
        if (!subtasksByParent[subtask.parentId]) {
          subtasksByParent[subtask.parentId] = [];
        }
        subtasksByParent[subtask.parentId]?.push(subtask);
      }
    });

    console.log('Subtasks by parent:', subtasksByParent);

    // Update each parent task status based on its subtasks
    const updatedTasks = [...tasks];
    Object.entries(subtasksByParent).forEach(([parentId, parentSubtasks]) => {
      const parentTask = updatedTasks.find(task => task.id === parentId);
      if (parentTask) {
        // Check if all subtasks are completed
        const allCompleted = parentSubtasks.every(subtask => subtask.status === 'completed');
        // Check if any subtask is in-progress
        const anyInProgress = parentSubtasks.some(subtask => subtask.status === 'in-progress');

        console.log(`Parent task ${parentId} - ${parentTask.name}:`);
        console.log(`- All completed: ${allCompleted}`);
        console.log(`- Any in progress: ${anyInProgress}`);
        console.log(`- Current status: ${parentTask.status}`);

        if (allCompleted) {
          console.log(`All subtasks for ${parentId} are completed, marking parent as completed`);
          parentTask.status = 'completed';
        } else if (anyInProgress) {
          console.log(`Some subtasks for ${parentId} are in-progress, marking parent as in-progress`);
          parentTask.status = 'in-progress';
        } else {
          console.log(`No subtasks for ${parentId} are completed or in-progress, marking parent as pending`);
          parentTask.status = 'pending';
        }

        console.log(`- New status: ${parentTask.status}`);
      }
    });

    // Update the tasks state
    console.log('Updated tasks:', updatedTasks);
    setTasks(updatedTasks);
  }, [subtasks, tasks]);

  // Update subtask status
  const updateSubtaskStatus = useCallback((subtaskId: string, status: TaskStatus) => {
    console.log(`Updating subtask ${subtaskId} status to ${status}`);

    // First, update the subtask status
    setSubtasks((prevSubtasks) => {
      const updatedSubtasks = prevSubtasks.map(subtask =>
        subtask.id === subtaskId ? { ...subtask, status } : subtask,
      );
      return updatedSubtasks;
    });

    // Then, find the subtask to get its parent ID
    const subtask = subtasks.find(s => s.id === subtaskId);
    if (!subtask || !subtask.parentId) {
      return; // No parent task to update
    }

    const parentId = subtask.parentId;

    // Call updateParentTaskStatus after a short delay to ensure subtasks state is updated
    setTimeout(() => {
      // Get the updated subtasks
      const updatedSubtasks = [...subtasks];
      // Update the status of the current subtask (since the state might not be updated yet)
      const updatedSubtasksWithCurrentChange = updatedSubtasks.map(s =>
        s.id === subtaskId ? { ...s, status } : s,
      );

      // Get all subtasks for this parent
      const parentSubtasks = updatedSubtasksWithCurrentChange.filter(s => s.parentId === parentId);

      // Update the parent task status based on its subtasks
      const updatedTasks = [...tasks];
      const parentTask = updatedTasks.find(task => task.id === parentId);

      if (parentTask) {
        // Check if all subtasks are completed
        const allCompleted = parentSubtasks.every(s => s.status === 'completed');
        // Check if any subtask is in-progress
        const anyInProgress = parentSubtasks.some(s => s.status === 'in-progress');

        console.log(`Parent task ${parentId} - ${parentTask.name}:`);
        console.log(`- All completed: ${allCompleted}`);
        console.log(`- Any in progress: ${anyInProgress}`);
        console.log(`- Current status: ${parentTask.status}`);

        if (allCompleted) {
          console.log(`All subtasks for ${parentId} are completed, marking parent as completed`);
          parentTask.status = 'completed';
        } else if (anyInProgress) {
          console.log(`Some subtasks for ${parentId} are in-progress, marking parent as in-progress`);
          parentTask.status = 'in-progress';
        } else {
          console.log(`No subtasks for ${parentId} are completed or in-progress, marking parent as pending`);
          parentTask.status = 'pending';
        }

        console.log(`- New status: ${parentTask.status}`);

        // Update the tasks state
        setTasks(updatedTasks);
      }
    }, 100);
  }, [subtasks, tasks]);

  const value = useMemo(() => ({
    tasks,
    subtasks,
    selectedTask,
    setSelectedTask,
    handleTaskSelect,

    // Form data for each task
    assembleTeamFormData,
    setAssembleTeamFormData,
    preliminaryResearchFormData,
    setPreliminaryResearchFormData,
    meetingObjectivesFormData,
    setMeetingObjectivesFormData,
    clientQuestionnaireFormData,
    setClientQuestionnaireFormData,
    presentationDeckFormData,
    setPresentationDeckFormData,
    draftProposalFormData,
    setDraftProposalFormData,

    // Legacy state
    clientData,
    setClientData,
    formSubmitted,
    setFormSubmitted,
    isGeneratingSurvey,
    setIsGeneratingSurvey,
    surveyResult,
    setSurveyResult,
    surveyError,
    setSurveyError,
    surveyCompleted,
    setSurveyCompleted,
    isGeneratingProposal,
    setIsGeneratingProposal,
    proposalResult,
    setProposalResult,
    proposalError,
    setProposalError,

    // AI model selection
    selectedModel,
    setSelectedModel,

    // Task management functions
    updateTaskStatus,
    updateSubtaskStatus,
    updateParentTaskStatus,
  }), [
    tasks,
    subtasks,
    selectedTask,
    setSelectedTask,
    handleTaskSelect,
    assembleTeamFormData,
    setAssembleTeamFormData,
    preliminaryResearchFormData,
    setPreliminaryResearchFormData,
    meetingObjectivesFormData,
    setMeetingObjectivesFormData,
    clientQuestionnaireFormData,
    setClientQuestionnaireFormData,
    presentationDeckFormData,
    setPresentationDeckFormData,
    draftProposalFormData,
    setDraftProposalFormData,
    clientData,
    setClientData,
    formSubmitted,
    setFormSubmitted,
    isGeneratingSurvey,
    setIsGeneratingSurvey,
    surveyResult,
    setSurveyResult,
    surveyError,
    setSurveyError,
    surveyCompleted,
    setSurveyCompleted,
    isGeneratingProposal,
    setIsGeneratingProposal,
    proposalResult,
    setProposalResult,
    proposalError,
    setProposalError,
    updateTaskStatus,
    updateSubtaskStatus,
    updateParentTaskStatus,
    selectedModel,
    setSelectedModel,
  ]);

  return (
    <ProjectContext value={value}>
      {children}
    </ProjectContext>
  );
};

export const useProjectContext = () => {
  const context = use(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};
