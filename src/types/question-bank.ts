/**
 * Schema definition for the question_bank table
 *
 * This follows the SQL schema:
 *
 * CREATE TABLE question_bank (
 *   question_id UUID PRIMARY KEY,
 *   topic_id UUID FOREIGN KEY,
 *   section VARCHAR(20) CHECK (section IN ('speaking', 'listening', 'writing')),
 *   part VARCHAR(10), -- e.g., 'part1', 'part2', 'part3' for speaking
 *   question_text TEXT NOT NULL,
 *   difficulty_level VARCHAR(10), -- e.g., 'easy', 'medium', 'hard'
 *   owner_type VARCHAR(10) CHECK (owner_type IN ('admin', 'organization')),
 *   owner_id UUID NOT NULL,
 *   visibility VARCHAR(10) CHECK (visibility IN ('public', 'private')) DEFAULT 'private',
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 */

export type Section = 'speaking' | 'listening' | 'writing';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type OwnerType = 'admin' | 'organization';
export type Visibility = 'public' | 'private';
export type TestType = 'full' | 'skill';
export type SkillType = 'speaking' | 'listening' | 'writing' | 'reading';

export type QuestionBank = {
  questionId: string;
  topicId: string;
  section: Section;
  part: string;
  questionText: string;
  difficultyLevel: DifficultyLevel;
  ownerType: OwnerType;
  ownerId: string;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
};

export type Topic = {
  id: string;
  title: string;
  description: string;
};

// Mock data type
export type MockData = {
  topics: Topic[];
  questions: QuestionBank[];
};
