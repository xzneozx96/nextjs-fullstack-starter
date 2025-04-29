import type { QuestionBank } from '../types/question-bank';

export const formatQuestionsByPart = (part: string, selectedQuestions: QuestionBank[]): string => {
  // Use selectedQuestions from the store instead of local state
  return selectedQuestions
    .filter(q => q.part === part)
    .map(q => q.questionText)
    .join('\n');
};
