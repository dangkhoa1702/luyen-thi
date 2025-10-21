
export type ViewType = 'dashboard' | 'ai-tutor' | 'chatbot' | 'planner' | 'community' | 'knowledge-base' | 'learning-profile' | 'parent-dashboard' | 'study-materials' | 'teacher-dashboard' | 'today-plan' | 'daily-reminder' | 'mock-exam-2';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role?: 'student' | 'teacher';
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface MockQuestion {
  id: number;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  userAnswer?: string;
}

export interface ProgressData {
  name: string;
  'Điểm': number;
}

export interface LearningProfile {
  strengths: { subject: string; topic: string }[];
  weaknesses: { subject: string; topic: string }[];
  recommendations: string[];
  motivationalQuote: string;
}

export interface StudyMaterial {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'image' | 'other';
  size: string;
  uploadedAt: string;
}