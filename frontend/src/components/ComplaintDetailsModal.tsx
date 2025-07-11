import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import type { Complaint, CaseNote, CaseStage } from '../types';
import { complaintsAPI } from '../utils/api';
import '../styles/ComplaintModal.css';

interface Suggestion {
  section: string;
  description: string;
  act?: string;
  isCognizable?: boolean;
  isBailable?: boolean;
  punishment?: string;
}

interface Judgment {
  title: string;
  year: number | string;
  summary: string;
  citation?: string;
  fullText?: string;
}

type ComplaintStatus = 'pending' | 'analyzed' | 'filed' | 'rejected' | 'closed';

interface ComplaintDetailsModalProps {
  complaint: Complaint;
  isOpen: boolean;
  onClose: () => void;
  userRole: 'police' | 'victim';
  onUpdateStatus?: (status: string, data: any) => Promise<void>;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  color: #1a237e;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  background-color: ${props => {
    switch (props.status) {
      case 'pending':
        return '#fff3cd';
      case 'analyzed':
        return '#cce5ff';
      case 'filed':
        return '#d4edda';
      case 'rejected':
        return '#f8d7da';
      default:
        return '#e2e3e5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending':
        return '#856404';
      case 'analyzed':
        return '#004085';
      case 'filed':
        return '#155724';
      case 'rejected':
        return '#721c24';
      default:
        return '#383d41';
    }
  }};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  margin-bottom: 0.5rem;
`;

const FieldLabel = styled.span`
  font-weight: bold;
  color: #666;
  font-size: 0.9rem;
`;

const FieldValue = styled.span`
  color: #333;
  margin-left: 0.5rem;
`;

const NotesList = styled.div`
  margin-top: 1rem;
`;

const NoteItem = styled.div<{ $isPublic: boolean }>`
  background-color: ${props => props.$isPublic ? '#e8f5e9' : '#f5f5f5'};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid ${props => props.$isPublic ? '#4caf50' : '#9e9e9e'};
`;

const NoteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const NoteAuthor = styled.span`
  font-weight: bold;
  color: #1a237e;
`;

const NoteTime = styled.span`
  color: #666;
  font-size: 0.8rem;
`;

const NoteContent = styled.p`
  margin: 0;
  color: #333;
`;

const VisibilityBadge = styled.span`
  background-color: #e0e0e0;
  color: #616161;
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  margin-left: 0.5rem;
`;

const StageBadge = styled.span`
  background-color: #e3f2fd;
  color: #1565c0;
  font-size: 0.8rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  margin-left: 0.5rem;
`;

const Form = styled.form`
  margin-top: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 100px;
  margin-bottom: 1rem;
  font-family: inherit;
  resize: vertical;
`;

const StageSelect = styled.select`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  margin-bottom: 1rem;
`;

const VisibilityToggle = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const VisibilityLabel = styled.label`
  margin-left: 0.5rem;
  color: #333;
`;

const SubmitButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: #1a237e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  
  &:hover {
    background-color: #283593;
  }
  
  &:disabled {
    background-color: #9fa8da;
    cursor: not-allowed;
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
`;

const SelectStatus = styled.select`
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.6rem 1.2rem;
  background-color: #1a237e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #283593;
  }
`;

const InputField = styled.input`
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 1rem;
  width: 150px;
`;

const ComplaintDetailsModal: React.FC<ComplaintDetailsModalProps> = ({ 
  complaint, 
  isOpen, 
  onClose, 
  userRole,
  onUpdateStatus 
}) => {
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [selectedStage, setSelectedStage] = useState<CaseStage | ''>('');
  const [isPublic, setIsPublic] = useState(false);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>(complaint.status);
  const [firNumber, setFirNumber] = useState(complaint.firNumber || '');
  const [appliedSections, setAppliedSections] = useState<string[]>(complaint.appliedSections || []);
  const [newSection, setNewSection] = useState('');
  
  useEffect(() => {
    if (isOpen && complaint.id) {
      fetchNotes();
    }
  }, [isOpen, complaint.id]);
  
  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await complaintsAPI.getNotes(complaint.id);
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNote.trim()) return;
    
    try {
      await complaintsAPI.addNote(complaint.id, {
        content: newNote,
        stage: (selectedStage as any) || undefined,
        visibility: isPublic ? 'public' : 'internal'
      });
      
      // Refresh notes
      fetchNotes();
      
      // Reset form
      setNewNote('');
      setSelectedStage('');
      setIsPublic(false);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };
  
  const handleUpdateStatus = async () => {
    if (!onUpdateStatus) return;
    
    try {
      const data: any = { status: newStatus };
      
      if (newStatus === 'filed' && firNumber) {
        data.firNumber = firNumber;
      }
      
      if (appliedSections.length > 0) {
        data.appliedSections = appliedSections;
      }
      
      await onUpdateStatus(complaint.id, data);
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };
  
  const handleAddSection = () => {
    if (!newSection.trim()) return;
    
    if (!appliedSections.includes(newSection)) {
      setAppliedSections([...appliedSections, newSection]);
    }
    
    setNewSection('');
  };
  
  const handleRemoveSection = (section: string) => {
    setAppliedSections(appliedSections.filter(s => s !== section));
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  if (!isOpen) return null;
  
  const caseStages: { value: CaseStage; label: string }[] = [
    { value: 'preliminary_inquiry', label: 'Preliminary Inquiry' },
    { value: 'evidence_collection', label: 'Evidence Collection' },
    { value: 'witness_interview', label: 'Witness Interview' },
    { value: 'suspect_identification', label: 'Suspect Identification' },
    { value: 'arrest', label: 'Arrest' },
    { value: 'charge_sheet', label: 'Charge Sheet' },
    { value: 'court_filing', label: 'Court Filing' },
    { value: 'trial', label: 'Trial' },
    { value: 'verdict', label: 'Verdict' },
    { value: 'closed', label: 'Closed' }
  ];
  
  // Add a function to format the complaint ID
  const formatComplaintId = (id: string) => {
    return `SAR-${id.slice(-6).toUpperCase()}`;
  };
  
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        
        <h2>
          Complaint {formatComplaintId(complaint.id)}
          <StatusBadge status={complaint.status} style={{ marginLeft: '1rem' }}>
            {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
          </StatusBadge>
        </h2>
        
        <Section>
          <SectionTitle>Basic Information</SectionTitle>
          <Grid>
            <Field>
              <FieldLabel>Complainant Name:</FieldLabel>
              <FieldValue>{complaint.complainantName}</FieldValue>
            </Field>
            
            {/* Only show phone number for police users */}
            {userRole === 'police' && (
              <Field>
                <FieldLabel>Phone Number:</FieldLabel>
                <FieldValue>{complaint.complainantPhone || 'Not available'}</FieldValue>
              </Field>
            )}
            
            {/* Show address and ID proof if available (police only) */}
            {userRole === 'police' && (
              <>
                <Field>
                  <FieldLabel>Address:</FieldLabel>
                  <FieldValue>{complaint.complainantAddress || 'Not available'}</FieldValue>
                </Field>
                
                <Field>
                  <FieldLabel>ID Proof:</FieldLabel>
                  <FieldValue>{(complaint as any).complainantIdProof || 'Not available'}</FieldValue>
                </Field>
              </>
            )}
            
            <Field>
              <FieldLabel>Filed Date:</FieldLabel>
              <FieldValue>{formatDate(complaint.filedAt)}</FieldValue>
            </Field>
            
            {complaint.firNumber && (
              <Field>
                <FieldLabel>FIR Number:</FieldLabel>
                <FieldValue>{complaint.firNumber}</FieldValue>
              </Field>
            )}
            
            {complaint.appliedSections && complaint.appliedSections.length > 0 && (
              <Field>
                <FieldLabel>Applied Sections:</FieldLabel>
                <FieldValue>{complaint.appliedSections.join(', ')}</FieldValue>
              </Field>
            )}
            
            {complaint.currentStage && (
              <Field>
                <FieldLabel>Current Stage:</FieldLabel>
                <FieldValue>
                  {caseStages.find(stage => stage.value === complaint.currentStage)?.label || complaint.currentStage}
                </FieldValue>
              </Field>
            )}
          </Grid>
        </Section>
        
        <Section>
          <SectionTitle>Complaint Text</SectionTitle>
          <p style={{ whiteSpace: 'pre-wrap' }}>{complaint.text}</p>
        </Section>
        
        {complaint.analysisResult && (
          <Section>
            <SectionTitle>Analysis Results</SectionTitle>
            
            {complaint.analysisResult.summary && (
              <div style={{ marginBottom: '1rem' }}>
                <h4>Summary</h4>
                <p>{complaint.analysisResult.summary}</p>
              </div>
            )}
            
            {complaint.analysisResult.suggestions && complaint.analysisResult.suggestions.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4>Suggested Sections</h4>
                <ul>
                  {complaint.analysisResult.suggestions.map((suggestion: Suggestion, index: number) => (
                    <li key={index}>
                      <strong>{suggestion.section}</strong>: {suggestion.description}
                      {suggestion.punishment && (
                        <div style={{ fontSize: '0.9em', marginTop: '0.3rem' }}>
                          <em>Punishment: {suggestion.punishment}</em>
                        </div>
                      )}
                      {suggestion.isCognizable !== undefined && (
                        <span style={{ 
                          display: 'inline-block',
                          margin: '0.3rem 0.5rem 0 0',
                          padding: '0.2rem 0.4rem',
                          fontSize: '0.7rem',
                          backgroundColor: suggestion.isCognizable ? '#d4edda' : '#f8d7da',
                          color: suggestion.isCognizable ? '#155724' : '#721c24',
                          borderRadius: '4px'
                        }}>
                          {suggestion.isCognizable ? 'Cognizable' : 'Non-Cognizable'}
                        </span>
                      )}
                      {suggestion.isBailable !== undefined && (
                        <span style={{ 
                          display: 'inline-block',
                          margin: '0.3rem 0 0 0',
                          padding: '0.2rem 0.4rem',
                          fontSize: '0.7rem',
                          backgroundColor: suggestion.isBailable ? '#d1ecf1' : '#f8d7da',
                          color: suggestion.isBailable ? '#0c5460' : '#721c24',
                          borderRadius: '4px'
                        }}>
                          {suggestion.isBailable ? 'Bailable' : 'Non-Bailable'}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {complaint.analysisResult.judgments && complaint.analysisResult.judgments.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4>Related Judgments</h4>
                <ul>
                  {complaint.analysisResult.judgments.map((judgment: Judgment, index: number) => (
                    <li key={index}>
                      <strong>{judgment.title} ({judgment.year})</strong>: {judgment.summary}
                      {judgment.citation && <div><em>Citation: {judgment.citation}</em></div>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {complaint.analysisResult.proceduralSteps && complaint.analysisResult.proceduralSteps.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4>Recommended Procedural Steps</h4>
                <ol>
                  {complaint.analysisResult.proceduralSteps.map((step: string, index: number) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
            
            {complaint.analysisResult.explanation && (
              <div>
                <h4>Detailed Analysis</h4>
                <p style={{ whiteSpace: 'pre-wrap' }}>{complaint.analysisResult.explanation}</p>
              </div>
            )}
          </Section>
        )}
        
        <Section>
          <SectionTitle>Case Notes</SectionTitle>
          
          {loading ? (
            <p>Loading notes...</p>
          ) : notes.length === 0 ? (
            <p>No notes available yet.</p>
          ) : (
            <NotesList>
              {notes.map(note => (
                <NoteItem key={note.id} $isPublic={note.visibility === 'public'}>
                  <NoteHeader>
                    <div>
                      <NoteAuthor>{note.author_name}</NoteAuthor>
                      {userRole === 'police' && (
                        <VisibilityBadge>
                          {note.visibility === 'public' ? 'Public' : 'Internal'}
                        </VisibilityBadge>
                      )}
                      {note.stage && (
                        <StageBadge>
                          {caseStages.find(s => s.value === note.stage)?.label || note.stage}
                        </StageBadge>
                      )}
                    </div>
                    <NoteTime>{formatDate(note.created_at)}</NoteTime>
                  </NoteHeader>
                  <NoteContent>{note.content}</NoteContent>
                </NoteItem>
              ))}
            </NotesList>
          )}
          
          {userRole === 'police' && (
            <Form onSubmit={handleAddNote}>
              <TextArea
                placeholder="Add a case note..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                required
              />
              
              <StageSelect
                value={selectedStage}
                onChange={e => setSelectedStage(e.target.value as CaseStage)}
              >
                <option value="">Select case stage (optional)</option>
                {caseStages.map(stage => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </StageSelect>
              
              <VisibilityToggle>
                <input
                  type="checkbox"
                  id="visibility"
                  checked={isPublic}
                  onChange={e => setIsPublic(e.target.checked)}
                />
                <VisibilityLabel htmlFor="visibility">
                  Make this note visible to the victim
                </VisibilityLabel>
              </VisibilityToggle>
              
              <SubmitButton type="submit" disabled={!newNote.trim()}>
                Add Note
              </SubmitButton>
            </Form>
          )}
        </Section>
        
        {userRole === 'police' && (
          <ActionBar>
            <div>
              <SelectStatus
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
              >
                <option value="pending">Pending</option>
                <option value="analyzed">Analyzed</option>
                <option value="filed">Filed</option>
                <option value="rejected">Rejected</option>
              </SelectStatus>
              
              {newStatus === 'filed' && (
                <InputField
                  type="text"
                  placeholder="FIR Number"
                  value={firNumber}
                  onChange={e => setFirNumber(e.target.value)}
                />
              )}
              
              <ActionButton type="button" onClick={handleUpdateStatus}>
                Update Status
              </ActionButton>
            </div>
          </ActionBar>
        )}
        
        {userRole === 'police' && (
          <Section>
            <SectionTitle>Applied IPC Sections</SectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {appliedSections.map(section => (
                <div key={section} style={{ 
                  background: '#e3f2fd', 
                  padding: '0.3rem 0.6rem', 
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {section}
                  <button 
                    onClick={() => handleRemoveSection(section)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1565c0',
                      marginLeft: '0.3rem',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <InputField
                type="text"
                placeholder="Add IPC Section (e.g. IPC 354)"
                value={newSection}
                onChange={e => setNewSection(e.target.value)}
              />
              <ActionButton
                type="button"
                onClick={handleAddSection}
                disabled={!newSection.trim()}
              >
                Add Section
              </ActionButton>
            </div>
          </Section>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default ComplaintDetailsModal;
