import type { AnalysisResult, Complaint, LegalRight, IPCSection } from '../types';

export const mockAnalysisResult: AnalysisResult = {
  suggestions: [
    {
      section: 'IPC 354',
      description: 'Assault or criminal force to woman with intent to outrage her modesty',
      confidence: 0.95
    },
    {
      section: 'IPC 509',
      description: 'Word, gesture or act intended to insult the modesty of a woman',
      confidence: 0.85
    }
  ],
  judgments: [
    {
      title: 'Vishaka vs State of Rajasthan',
      year: 1997,
      summary: 'Landmark case on sexual harassment at workplace',
      fullText: '...',
      relevantSections: ['IPC 354', 'IPC 509']
    }
  ],
  proceduralSteps: [
    'File a written complaint with the police station',
    'Get a copy of the FIR',
    'Cooperate with the investigation',
    'Attend court hearings when summoned'
  ]
};

export const mockComplaints: Complaint[] = [
  {
    id: '1',
    text: 'I was harassed at my workplace by my supervisor. He made inappropriate comments and touched me without consent.',
    language: 'en',
    status: 'filed',
    complainantName: 'Anushka Sharma',
    complainantId: 'VICT001',
    filedAt: '2024-03-15T10:30:00Z',
    firNumber: 'FIR/2024/001',
    appliedSections: ['IPC 354', 'IPC 509'],
    analysisResult: mockAnalysisResult
  },
  {
    id: '2',
    text: 'My neighbor has been playing loud music late at night, causing disturbance to the entire neighborhood.',
    language: 'en',
    status: 'pending',
    complainantName: 'Rajesh Kumar',
    complainantId: 'VICT002',
    filedAt: '2024-03-16T15:45:00Z'
  },
  {
    id: '3',
    text: 'Someone has been sending threatening messages to my family members.',
    language: 'hi',
    status: 'analyzed',
    complainantName: 'Priya Patel',
    complainantId: 'VICT003',
    filedAt: '2024-03-17T09:15:00Z',
    appliedSections: ['IPC 507']
  }
];

export const mockLegalRights: LegalRight[] = [
  {
    title: 'Right to File FIR',
    description: 'Every citizen has the right to file an FIR at any police station, regardless of where the crime occurred.',
    section: 'Section 154 CrPC'
  },
  {
    title: 'Right to Know FIR Status',
    description: 'You have the right to know the status of your FIR and get a copy of it.',
    section: 'Section 154(2) CrPC'
  },
  {
    title: 'Right to Legal Aid',
    description: 'Free legal aid is available for those who cannot afford a lawyer.',
    section: 'Section 304 CrPC'
  }
];

export const mockIPCSections: IPCSection[] = [
  {
    number: 'IPC 354A',
    title: 'Sexual Harassment',
    description: 'Physical contact and advances involving unwelcome and explicit sexual overtures',
    punishment: 'Imprisonment up to 3 years, or fine, or both',
    isCognizable: true,
    isBailable: true
  },
  {
    number: 'IPC 379',
    title: 'Theft',
    description: 'Whoever, intending to take dishonestly any moveable property out of the possession of any person',
    punishment: 'Imprisonment up to 3 years, or fine, or both',
    isCognizable: true,
    isBailable: true
  },
  {
    number: 'IPC 323',
    title: 'Voluntary Hurt',
    description: 'Whoever causes hurt to any person',
    punishment: 'Imprisonment up to 1 year, or fine up to ₹1000, or both',
    isCognizable: true,
    isBailable: true
  }
]; 