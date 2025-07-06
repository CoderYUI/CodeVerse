export type Language = 'English' | 'Hindi' | 'Marathi' | 'Tamil';

export type UserRole = 'police' | 'victim';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface LegalSuggestion {
  section: string;
  description: string;
  act: string;
  isCognizable: boolean;
  isBailable: boolean;
  punishment: string;
}

export interface Judgment {
  title: string;
  year: number;
  summary: string;
  fullText: string;
  citation: string;
}

export interface AnalysisResult {
  suggestions: LegalSuggestion[];
  judgments: Judgment[];
  proceduralSteps: string[];
}

export interface Complaint {
  id: string;
  text: string;
  language: Language;
  status: 'pending' | 'analyzed' | 'filed' | 'rejected';
  createdAt: string;
  assignedOfficer?: string;
  firNumber?: string;
  appliedSections?: string[];
}

export interface LegalRight {
  title: string;
  description: string;
  section?: string;
}

export interface IPCSection {
  number: string;
  title: string;
  description: string;
  punishment: string;
  isCognizable: boolean;
  isBailable: boolean;
} 