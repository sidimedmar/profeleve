export enum QuestionType {
  SINGLE = 'single', // Radio
  MULTIPLE = 'multiple' // Checkbox
}

export interface Option {
  id: number;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: Option[];
  correctOptionIds: number[];
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  isActive: boolean;
}

export interface Submission {
  id: string;
  studentName: string;
  studentPhone: string;
  answers: Record<string, number[]>; // questionId -> selected option IDs
  score: number;
  totalPoints: number;
  percentage: number;
  timestamp: number;
}

export type ViewState = 'landing' | 'professor-edit' | 'professor-dashboard' | 'student-login' | 'student-quiz';

export type Language = 'fr' | 'ar';

export interface Translation {
  roleProfessor: string;
  roleStudent: string;
  createQuiz: string;
  viewResults: string;
  takeQuiz: string;
  welcome: string;
  question: string;
  options: string;
  points: string;
  addQuestion: string;
  publishQuiz: string;
  studentName: string;
  studentPhone: string;
  startQuiz: string;
  submit: string;
  score: string;
  totalSubmissions: string;
  averageScore: string;
  generateWithAI: string;
  topicPrompt: string;
  generating: string;
  correctAnswer: string;
  typeSingle: string;
  typeMultiple: string;
  delete: string;
  back: string;
  dashboard: string;
  noQuizActive: string;
  questionText: string;
  optionText: string;
  isCorrect: string;
  required: string;
}