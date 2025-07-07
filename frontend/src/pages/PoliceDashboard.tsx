import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import type { Complaint } from '../types';
import { mockComplaints } from '../data/mockData';
import '../styles/Dashboard.css';
import { complaintsAPI, authAPI } from '../utils/api';
import { analyzeComplaint, fallbackAnalysis, transcribeSpeech } from '../utils/geminiService';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 6rem 2rem 4rem;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const WelcomeSection = styled.section`
  background: white;
  border-radius: 10px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const WelcomeTitle = styled.h1`
  color: #1a237e;
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const WelcomeSubtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  color: #1a237e;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const ComplaintsSection = styled.section`
  background: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  color: #1a237e;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
`;

const ComplaintList = styled.div`
  display: grid;
  gap: 1rem;
`;

const ComplaintCard = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const ComplaintHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ComplaintTitle = styled.h3`
  color: #1a237e;
  font-size: 1.1rem;
  margin: 0;
`;

const ComplaintStatus = styled.span<{ status: string }>`
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

const ComplaintDetails = styled.div`
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const ComplainantInfo = styled.div`
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const ActionButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: #1a237e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #283593;
  }
`;

// New styled components for the victim registration modal
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ModalTitle = styled.h2`
  color: #1a237e;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;

  &:hover {
    color: #1a237e;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;

  &:focus {
    outline: none;
    border-color: #1a237e;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const CancelButton = styled.button`
  padding: 0.8rem 1.5rem;
  background: white;
  color: #1a237e;
  border: 1px solid #1a237e;
  border-radius: 4px;
  cursor: pointer;
`;

const SuccessMessage = styled.div`
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

// Additional styled components for speech-to-text and analysis
const TabContainer = styled.div`
  display: flex;
  margin-bottom: 1rem;
`;

// Fix the Tab component - use transient props with $
const Tab = styled.button<{ $active: string }>`
  padding: 0.8rem 1.5rem;
  background: ${props => props.$active === 'true' ? '#1a237e' : '#f5f5f5'};
  color: ${props => props.$active === 'true' ? 'white' : '#333'};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
  font-weight: ${props => props.$active === 'true' ? 'bold' : 'normal'};
  
  &:hover {
    background: ${props => props.$active === 'true' ? '#1a237e' : '#e0e0e0'};
  }
`;

// Fix the VoiceButton component - use transient props with $
const VoiceButton = styled.button<{ $isListening: string }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background-color: ${props => props.$isListening === 'true' ? '#f44336' : '#1a237e'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 1rem auto;
  transition: all 0.3s ease;
  animation: ${props => props.$isListening === 'true' ? 'pulse 1.5s infinite' : 'none'};
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
    }
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
  
  &:hover {
    transform: scale(1.1);
  }
`;

const AnalysisSection = styled.div`
  background-color: #f5f7ff;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
`;

const AnalysisResult = styled.div`
  margin-bottom: 1.5rem;
`;

const AnalysisHeading = styled.h4`
  color: #1a237e;
  margin-bottom: 0.5rem;
`;

const SectionsList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const SectionItem = styled.li`
  background-color: white;
  padding: 0.8rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  border-left: 3px solid #1a237e;
`;

// Fix the CognizableStatus component - use transient props with $
const CognizableStatus = styled.div<{ $isCognizable: string }>`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  background-color: ${props => props.$isCognizable === 'true' ? '#e8f5e9' : '#ffebee'};
  color: ${props => props.$isCognizable === 'true' ? '#2e7d32' : '#c62828'};
  margin-bottom: 1rem;
`;

const LoadingSpinner = styled.div`
  margin: 1rem auto;
  text-align: center;
  
  &:after {
    content: " ";
    display: block;
    width: 30px;
    height: 30px;
    margin: 8px auto;
    border-radius: 50%;
    border: 6px solid #1a237e;
    border-color: #1a237e transparent #1a237e transparent;
    animation: spin 1.2s linear infinite;
  }
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const SectionHeading = styled.h3`
  color: #1a237e;
  font-size: 1.1rem;
  margin: 1.5rem 0 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
`;

const TagInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  gap: 0.5rem;
  align-items: center;

  input {
    flex: 1;
    min-width: 100px;
    border: none;
    outline: none;
    padding: 0.5rem;
    font-family: inherit;
  }
`;

const Tag = styled.div`
  display: flex;
  align-items: center;
  background-color: #e8eaf6;
  color: #1a237e;
  padding: 0.3rem 0.6rem;
  border-radius: 16px;
  font-size: 0.9rem;
`;

const TagRemoveButton = styled.button`
  background: none;
  border: none;
  color: #5c6bc0;
  margin-left: 0.3rem;
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  width: 18px;
  border-radius: 50%;

  &:hover {
    background-color: #c5cae9;
    color: #3949ab;
  }
`;

const InputHint = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.3rem;
`;

const PoliceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Replace separate modals with a single complaint modal
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintFormData, setComplaintFormData] = useState({
    victim_name: '',
    victim_phone: '',
    victim_address: '',
    victim_id_proof: '',
    complaint_text: '',
    complaint_language: 'en',
    complaint_category: '',
    ipc_sections: [] as string[],
    other_category: '',
    incident_date: '',
    incident_location: ''
  });
  
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // State for complaint analysis
  const [analysisResult, setAnalysisResult] = useState<{
    isCognizable: boolean;
    sections: Array<{section: string; description: string}>;
    summary: string;
    explanation: string;
  } | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'voice'>('text');
  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef<{
    start: () => void;
    stop: () => void;
    isListening: () => boolean;
  } | null>(null);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser);
        setUser(user);
        console.log("Police Dashboard initialized with user:", user.name);
        
        // Verify token before fetching complaints
        authAPI.verifyToken()
          .then(isValid => {
            if (isValid) {
              fetchComplaints();
            } else {
              console.error("Token not valid");
              navigate('/login');
            }
          })
          .catch(err => {
            console.error("Token verification failed:", err);
            navigate('/login');
          });
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate('/login');
      }
    } else {
      console.log("No user or token found, redirecting to login");
      navigate('/login');
    }
  }, [navigate]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      console.log("Fetching complaints...");
      const response = await complaintsAPI.getAll();
      console.log("Complaints fetched successfully:", response.data.length);
      setComplaints(response.data);
    } catch (error: any) {
      console.error('Error fetching complaints:', error);
      
      if (error.response?.status === 401 || error.response?.status === 422) {
        setError("Authentication error. Please log in again.");
        // We'll let the API interceptor handle the redirect
        return;
      }
      
      setError(error.response?.data?.error || 'Failed to load complaints. Please try again.');
      console.log("Using mock data as fallback");
      setComplaints(mockComplaints);
    } finally {
      setLoading(false);
    }
  };

  // Replace both handlers with a single handler for the new complaint form
  const handleNewComplaint = () => {
    setShowComplaintModal(true);
  };

  // Function to toggle speech recognition
  const toggleSpeechRecognition = () => {
    if (!speechRecognitionRef.current) {
      speechRecognitionRef.current = transcribeSpeech(
        complaintFormData.complaint_language,
        (text: string) => {  // Add explicit type for text parameter
          setComplaintFormData(prev => ({
            ...prev,
            complaint_text: text
          }));
        },
        (error: string) => {  // Add explicit type for error parameter
          setError(error);
          setIsListening(false);
        }
      );
    }
    
    if (isListening) {
      speechRecognitionRef.current?.stop();  // Use optional chaining to handle null case
    } else {
      speechRecognitionRef.current?.start();  // Use optional chaining to handle null case
      setIsListening(true);
    }
  };
  
  // Add a function to apply analysis results to form fields
  const applyAnalysisToForm = (result: any) => {
    if (!result) return;
    
    // Determine category based on sections
    let category = '';
    if (result.sections.some((s: any) => s.section.includes('354') || s.section.includes('376'))) {
      category = 'sexual_assault';
    } else if (result.sections.some((s: any) => s.section.includes('323') || s.section.includes('324') || s.section.includes('325'))) {
      category = 'physical_violence';
    } else if (result.sections.some((s: any) => s.section.includes('379') || s.section.includes('380'))) {
      category = 'theft';
    } else if (result.sections.some((s: any) => s.section.includes('498'))) {
      category = 'domestic_violence';
    } else if (result.sections.some((s: any) => s.section.includes('420') || s.section.includes('406'))) {
      category = 'fraud';
    } else {
      category = 'other';
    }
    
    // Extract IPC section numbers
    const ipcSections = result.sections.map((s: any) => s.section);
    
    // Update form with analysis data
    setComplaintFormData(prev => ({
      ...prev,
      complaint_category: category,
      ipc_sections: ipcSections,
      other_category: category === 'other' ? result.summary.split(' ')[0] : ''
    }));
  };

  // Function to analyze complaint with better error handling
  const handleAnalyzeComplaint = async () => {
    if (!complaintFormData.complaint_text) {
      setError('Please enter complaint text to analyze');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // First try using Gemini API
      const result = await analyzeComplaint(
        complaintFormData.complaint_text,
        complaintFormData.complaint_language
      );
      
      setAnalysisResult(result);
      applyAnalysisToForm(result); // Apply results to form fields
    } catch (error: any) {
      console.error('Error in primary analysis method:', error);
      
      // Show a user-friendly error message
      setError(`Analysis error: ${error.message || 'Unknown error'}. Switching to fallback analysis.`);
      
      // Use fallback analysis method
      const fallbackResult = fallbackAnalysis(complaintFormData.complaint_text);
      setAnalysisResult(fallbackResult);
      applyAnalysisToForm(fallbackResult); // Apply fallback results to form fields
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Reset speech recognition when language changes
  useEffect(() => {
    if (speechRecognitionRef.current && isListening) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
      
      // Create new speech recognition with updated language
      speechRecognitionRef.current = transcribeSpeech(
        complaintFormData.complaint_language,
        (text: string) => {  // Add explicit type for text parameter
          setComplaintFormData(prev => ({
            ...prev,
            complaint_text: text
          }));
        },
        (error: string) => {  // Add explicit type for error parameter
          setError(error);
          setIsListening(false);
        }
      );
    }
  }, [complaintFormData.complaint_language]);
  
  // Clean up speech recognition on component unmount
  useEffect(() => {
    return () => {
      if (speechRecognitionRef.current && isListening) {
        speechRecognitionRef.current.stop();
      }
    };
  }, [isListening]);

  // Fix the unused 'response' variable
  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { 
      victim_name, 
      victim_phone, 
      complaint_text, 
      complaint_language,
      complaint_category,
      other_category,
      ipc_sections,
      incident_date,
      incident_location
    } = complaintFormData;

    if (!victim_name || !victim_phone || !complaint_text) {
      setError('Victim name, phone number, and complaint text are required');
      return;
    }

    setSubmittingComplaint(true);
    setError(null);

    try {
      // Create the complaint with all information
      const complaintData = {
        text: complaint_text,
        language: complaint_language,
        victim_name: victim_name,
        victim_phone: victim_phone,
        victim_details: {
          address: complaintFormData.victim_address,
          id_proof: complaintFormData.victim_id_proof
        },
        incident_details: {
          date: incident_date,
          location: incident_location,
          category: complaint_category === 'other' ? other_category : complaint_category
        },
        legal_classification: {
          ipc_sections: ipc_sections,
        },
        // Include analysis results if available
        analysisResult: analysisResult
      };

      await complaintsAPI.create(complaintData);
      setSubmitSuccess(`Complaint registered successfully for ${victim_name}`);

      // Reset form
      setComplaintFormData({
        victim_name: '',
        victim_phone: '',
        victim_address: '',
        victim_id_proof: '',
        complaint_text: '',
        complaint_language: 'en',
        complaint_category: '',
        ipc_sections: [],
        other_category: '',
        incident_date: '',
        incident_location: ''
      });
      
      // Reset analysis
      setAnalysisResult(null);

      // Close modal after 3 seconds and refresh complaints
      setTimeout(() => {
        setShowComplaintModal(false);
        setSubmitSuccess(null);
        fetchComplaints();
      }, 3000);
    } catch (error: any) {
      console.error('Error submitting complaint:', error);
      setError(error.response?.data?.error || 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setComplaintFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleComplaintClick = (complaint: Complaint) => {
    navigate(`/complaints/${complaint.id}`);
  };

  if (!user) {
    return null;
  }

  // New render for the complaint modal with tabs and analysis
  const renderComplaintModal = () => {
    if (!showComplaintModal) return null;
    
    const complaintCategories = [
      { value: '', label: 'Select a category' },
      { value: 'theft', label: 'Theft/Robbery' },
      { value: 'physical_violence', label: 'Physical Violence/Assault' },
      { value: 'sexual_assault', label: 'Sexual Harassment/Assault' },
      { value: 'domestic_violence', label: 'Domestic Violence' },
      { value: 'cybercrime', label: 'Cybercrime' },
      { value: 'fraud', label: 'Fraud/Cheating' },
      { value: 'property_dispute', label: 'Property Dispute' },
      { value: 'other', label: 'Other' }
    ];
    
    return (
      <Modal>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Register New Complaint</ModalTitle>
            <CloseButton onClick={() => setShowComplaintModal(false)}>&times;</CloseButton>
          </ModalHeader>

          {submitSuccess && (
            <SuccessMessage>{submitSuccess}</SuccessMessage>
          )}

          {error && (
            <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>
          )}

          <Form onSubmit={handleComplaintSubmit}>
            {/* Victim Information Section */}
            <SectionHeading>Victim Information</SectionHeading>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormField>
                <Label htmlFor="victim_name">Victim Name *</Label>
                <Input
                  type="text"
                  id="victim_name"
                  name="victim_name"
                  value={complaintFormData.victim_name}
                  onChange={handleInputChange}
                  required
                />
              </FormField>

              <FormField>
                <Label htmlFor="victim_phone">Phone Number *</Label>
                <Input
                  type="tel"
                  id="victim_phone"
                  name="victim_phone"
                  value={complaintFormData.victim_phone}
                  onChange={handleInputChange}
                  placeholder="e.g. 9876543210"
                  required
                />
              </FormField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormField>
                <Label htmlFor="victim_address">Address</Label>
                <Input
                  type="text"
                  id="victim_address"
                  name="victim_address"
                  value={complaintFormData.victim_address}
                  onChange={handleInputChange}
                />
              </FormField>

              <FormField>
                <Label htmlFor="victim_id_proof">ID Proof</Label>
                <Input
                  type="text"
                  id="victim_id_proof"
                  name="victim_id_proof"
                  value={complaintFormData.victim_id_proof}
                  onChange={handleInputChange}
                  placeholder="e.g. Aadhaar: XXXX-XXXX-1234"
                />
              </FormField>
            </div>

            {/* Incident Details Section */}
            <SectionHeading>Incident Details</SectionHeading>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormField>
                <Label htmlFor="incident_date">Date of Incident</Label>
                <Input
                  type="date"
                  id="incident_date"
                  name="incident_date"
                  value={complaintFormData.incident_date}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]} // Can't be future date
                />
              </FormField>

              <FormField>
                <Label htmlFor="incident_location">Location of Incident</Label>
                <Input
                  type="text"
                  id="incident_location"
                  name="incident_location"
                  value={complaintFormData.incident_location}
                  onChange={handleInputChange}
                  placeholder="Where did the incident occur?"
                />
              </FormField>
            </div>

            <FormField>
              <Label htmlFor="complaint_language">Language</Label>
              <select
                id="complaint_language"
                name="complaint_language"
                value={complaintFormData.complaint_language}
                onChange={handleInputChange}
                style={{
                  padding: '0.8rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  width: '100%'
                }}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </FormField>

            <FormField>
              <Label htmlFor="complaint_text">Complaint Details *</Label>
              
              <TabContainer>
                <Tab 
                  $active={activeTab === 'text' ? 'true' : 'false'} 
                  onClick={() => setActiveTab('text')}
                >
                  Text Input
                </Tab>
                <Tab 
                  $active={activeTab === 'voice' ? 'true' : 'false'} 
                  onClick={() => setActiveTab('voice')}
                >
                  Voice Input
                </Tab>
              </TabContainer>
              
              {activeTab === 'voice' && (
                <VoiceButton 
                  type="button"
                  $isListening={isListening ? 'true' : 'false'}
                  onClick={toggleSpeechRecognition}
                >
                  {isListening ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 12.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-6 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-6 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
                    </svg>
                  )}
                </VoiceButton>
              )}
              
              <textarea
                id="complaint_text"
                name="complaint_text"
                value={complaintFormData.complaint_text}
                onChange={handleInputChange}
                required
                rows={5}
                style={{
                  padding: '0.8rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  width: '100%',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
                placeholder={`Enter the victim's complaint in detail...${activeTab === 'voice' ? ' or use voice input' : ''}`}
              />
            </FormField>
            
            {/* Analyze button */}
            {complaintFormData.complaint_text && (
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <ActionButton 
                  type="button" 
                  onClick={handleAnalyzeComplaint}
                  disabled={isAnalyzing}
                  style={{ 
                    background: '#4a148c', 
                    padding: '0.6rem 1.2rem',
                    marginRight: '0.5rem'
                  }}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Complaint'}
                </ActionButton>
              </div>
            )}
            
            {/* Analysis results */}
            {isAnalyzing && (
              <LoadingSpinner>
                Analyzing complaint...
              </LoadingSpinner>
            )}
            
            {analysisResult && !isAnalyzing && (
              <AnalysisSection>
                <CognizableStatus $isCognizable={analysisResult.isCognizable ? 'true' : 'false'}>
                  {analysisResult.isCognizable ? 'Cognizable Offense' : 'Non-Cognizable Offense'}
                </CognizableStatus>
                
                <AnalysisResult>
                  <AnalysisHeading>Summary</AnalysisHeading>
                  <p>{analysisResult.summary}</p>
                </AnalysisResult>
                
                <AnalysisResult>
                  <AnalysisHeading>Applicable IPC Sections</AnalysisHeading>
                  <SectionsList>
                    {analysisResult.sections.map((section, index) => (
                      <SectionItem key={index}>
                        <strong>{section.section}</strong>: {section.description}
                      </SectionItem>
                    ))}
                  </SectionsList>
                </AnalysisResult>
                
                <AnalysisResult>
                  <AnalysisHeading>Detailed Explanation</AnalysisHeading>
                  <p>{analysisResult.explanation}</p>
                </AnalysisResult>
              </AnalysisSection>
            )}

            {/* Complaint Classification Section */}
            <SectionHeading>Complaint Classification</SectionHeading>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormField>
                <Label htmlFor="complaint_category">Complaint Category</Label>
                <select
                  id="complaint_category"
                  name="complaint_category"
                  value={complaintFormData.complaint_category}
                  onChange={handleInputChange}
                  style={{
                    padding: '0.8rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    width: '100%'
                  }}
                >
                  {complaintCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </FormField>

              {complaintFormData.complaint_category === 'other' && (
                <FormField>
                  <Label htmlFor="other_category">Specify Category</Label>
                  <Input
                    type="text"
                    id="other_category"
                    name="other_category"
                    value={complaintFormData.other_category}
                    onChange={handleInputChange}
                    placeholder="Enter a short category name (e.g. 'KIDNAPPING')"
                    maxLength={20} // Limit the length to encourage brevity
                  />
                  <InputHint>Use uppercase letters for a standard format</InputHint>
                </FormField>
              )}
            </div>

            <FormField>
              <Label htmlFor="ipc_sections">Applicable IPC Sections</Label>
              <TagInput>
                {complaintFormData.ipc_sections.map((section, index) => (
                  <Tag key={index}>
                    {section}
                    <TagRemoveButton 
                      onClick={(e) => {
                        e.preventDefault();
                        setComplaintFormData(prev => ({
                          ...prev,
                          ipc_sections: prev.ipc_sections.filter((_, i) => i !== index)
                        }));
                      }}
                    >
                      ×
                    </TagRemoveButton>
                  </Tag>
                ))}
                <input
                  type="text"
                  placeholder="Type IPC section and press Enter"
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      e.preventDefault();
                      const newSection = e.currentTarget.value;
                      if (!complaintFormData.ipc_sections.includes(newSection)) {
                        setComplaintFormData(prev => ({
                          ...prev,
                          ipc_sections: [...prev.ipc_sections, newSection]
                        }));
                      }
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </TagInput>
              <InputHint>Press Enter to add a section. Example: IPC 354</InputHint>
            </FormField>

            <ModalActions>
              <CancelButton type="button" onClick={() => setShowComplaintModal(false)}>
                Cancel
              </CancelButton>
              <ActionButton type="submit" disabled={submittingComplaint}>
                {submittingComplaint ? 'Submitting...' : 'Register Complaint'}
              </ActionButton>
            </ModalActions>
          </Form>
        </ModalContent>
      </Modal>
    );
  };

  return (
    <DashboardContainer>
      <Content>
        <WelcomeSection>
          <WelcomeTitle>Welcome, Inspector {user.name}</WelcomeTitle>
          <WelcomeSubtitle>Manage and process complaints efficiently</WelcomeSubtitle>
        </WelcomeSection>

        <StatsGrid>
          <StatCard>
            <StatNumber>{complaints.length}</StatNumber>
            <StatLabel>Total Complaints</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>
              {complaints.filter(c => c.status === 'filed').length}
            </StatNumber>
            <StatLabel>FIRs Filed</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>
              {complaints.filter(c => c.status === 'pending').length}
            </StatNumber>
            <StatLabel>Pending Analysis</StatLabel>
          </StatCard>
        </StatsGrid>

        <ComplaintsSection>
          <SectionTitle>Recent Complaints</SectionTitle>
          {loading ? (
            <p>Loading complaints...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : complaints.length === 0 ? (
            <p>No complaints found.</p>
          ) : (
            <ComplaintList>
              {complaints.map(complaint => (
                <ComplaintCard
                  key={complaint.id}
                  onClick={() => handleComplaintClick(complaint)}
                >
                  <ComplaintHeader>
                    <ComplaintTitle>
                      Complaint #{complaint.id}
                    </ComplaintTitle>
                    <ComplaintStatus status={complaint.status}>
                      {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                    </ComplaintStatus>
                  </ComplaintHeader>
                  <ComplaintDetails>
                    <ComplainantInfo>
                      Filed by: {complaint.complainantName}
                    </ComplainantInfo>
                    <p>{complaint.text.substring(0, 150)}...</p>
                    {complaint.firNumber && (
                      <p>FIR Number: {complaint.firNumber}</p>
                    )}
                    {complaint.appliedSections && (
                      <p>Applied Sections: {complaint.appliedSections.join(', ')}</p>
                    )}
                  </ComplaintDetails>
                </ComplaintCard>
              ))}
            </ComplaintList>
          )}
        </ComplaintsSection>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <ActionButton onClick={handleNewComplaint}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px' }}>
              <path d="M8 0a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2H9v6a1 1 0 1 1-2 0V9H1a1 1 0 0 1 0-2h6V1a1 1 0 0 1 1-1z"/>
            </svg>
            Add New Complaint
          </ActionButton>
        </div>
      </Content>

      {/* Render our enhanced complaint modal */}
      {renderComplaintModal()}
    </DashboardContainer>
  );
};

export default PoliceDashboard;