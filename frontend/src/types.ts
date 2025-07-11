export type UserRole = 'police' | 'victim';

export type Language = 'en' | 'hi' | 'mr' | 'gu' | 'bn' | 'ta' | 'te' | 'ml' | 'kn';

export type CaseStage = 
  'preliminary_inquiry' | 
  'evidence_collection' | 
  'witness_interview' | 
  'suspect_identification' | 
  'arrest' | 
  'charge_sheet' | 
  'court_filing' | 
  'trial' | 
  'verdict' | 
  'closed';

export type ComplaintStatus = 'pending' | 'analyzed' | 'filed' | 'rejected' | 'closed';

export interface Complaint {
  id: string;
  text: string;
  language: string;
  status: ComplaintStatus;
  complainantId: string;
  complainantName: string;
  complainantPhone?: string;
  complainantAddress?: string;  // Added property
  complainantIdProof?: string;  // Added property
  filedAt: string;
  updatedAt?: string;
  firNumber?: string;
  appliedSections?: string[];
  filedBy?: {
    id: string;
    name: string;
    role: string;
  };
  analysisResult?: any;
  currentStage?: CaseStage; // Added this field
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

export interface CaseNote {
  id: string;
  complaint_id: string;
  author_id: string;
  author_name: string;
  content: string;
  stage?: CaseStage;
  visibility: 'internal' | 'public';
  created_at: string;
}