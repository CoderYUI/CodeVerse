export type UserRole = 'police' | 'victim';

export type Language = 'en' | 'hi' | 'mr' | 'gu' | 'bn' | 'ta' | 'te' | 'ml' | 'kn';

export type ComplaintStatus = 'pending' | 'analyzed' | 'filed' | 'rejected';

export interface Complaint {
  id: string;
  text: string;
  language: Language;
  status: ComplaintStatus;
  complainantName: string;
  complainantId: string;
  filedAt: string;
  firNumber?: string;
  appliedSections?: string[];
  analysisResult?: AnalysisResult;
}

export interface AnalysisResult {
  suggestions: Suggestion[];
  judgments: Judgment[];
  proceduralSteps: string[];
}

export interface Suggestion {
  section: string;
  description: string;
  confidence: number;
}

export interface Judgment {
  title: string;
  year: number;
  summary: string;
  fullText: string;
  relevantSections: string[];
} 