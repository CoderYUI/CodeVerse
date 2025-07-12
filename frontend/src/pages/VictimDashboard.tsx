import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import type { Complaint } from '../types';
import { mockComplaints } from '../data/mockData';
import '../styles/Dashboard.css';
import { complaintsAPI } from '../utils/api';
import ComplaintDetailsModal from '../components/ComplaintDetailsModal';

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

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  margin-top: 1rem;

  &:hover {
    background: #283593;
    transform: translateY(-2px);
  }
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
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  color: #1a237e;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
`;

const ComplaintsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ComplaintCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const ComplaintTitle = styled.h3`
  color: #1a237e;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const ComplaintDate = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const ComplaintPreview = styled.p`
  color: #333;
  font-size: 1rem;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

// New components for the filing complaint feature
const Modal = styled.div`
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
`;

const TextArea = styled.textarea`
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  min-height: 150px;
  font-family: inherit;
  font-size: 1rem;
`;

const Select = styled.select`
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
`;

const SubmitButton = styled.button`
  padding: 1rem 2rem;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  align-self: flex-end;

  &:hover {
    background: #283593;
  }

  &:disabled {
    background: #9fa8da;
    cursor: not-allowed;
  }
`;

const VictimDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newComplaint, setNewComplaint] = useState('');
  const [language, setLanguage] = useState('English');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Add state for active tab
  const [activeTab, setActiveTab] = useState<'home' | 'file' | 'track'>('home');

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchComplaints();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await complaintsAPI.getAll();
      setComplaints(response.data);
    } catch (error: any) {
      console.error('Error fetching complaints:', error);
      setError(error.response?.data?.error || 'Failed to load complaints. Please try again.');
      
      // Fallback to mock data if API fails
      setComplaints(mockComplaints);
    } finally {
      setLoading(false);
    }
  };

  const handleNewComplaint = () => {
    navigate('/analyze');
  };

  const handleComplaintClick = (complaint: Complaint) => {
    // Fetch the complete complaint data with full text before showing the modal
    complaintsAPI.get(complaint.id)
      .then(response => {
        setSelectedComplaint(response.data);
        setShowModal(true);
      })
      .catch(error => {
        console.error('Error fetching complete complaint:', error);
        // Fall back to the truncated version if we can't get the full version
        setSelectedComplaint(complaint);
        setShowModal(true);
      });
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedComplaint(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Format complaint ID for display
  const formatComplaintId = (id: string) => {
    return `SAR-${id.slice(-6).toUpperCase()}`;
  };

  // New functions for filing complaints
  const openComplaintModal = () => {
    setShowModal(true);
  };

  const closeComplaintModal = () => {
    setShowModal(false);
    setNewComplaint('');
    setLanguage('English');
    setErrorMsg('');
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComplaint.trim()) {
      setErrorMsg('Please enter your complaint text');
      return;
    }
    
    setSubmitting(true);
    setErrorMsg('');
    
    try {
      await complaintsAPI.fileComplaint({
        text: newComplaint,
        language: language.toLowerCase()
      });
      
      // Refresh complaints list
      fetchComplaints();
      
      // Close modal
      closeComplaintModal();
      
      // Show success message (you can add a toast notification here)
      alert('Complaint filed successfully!');
    } catch (error: any) {
      console.error('Error filing complaint:', error);
      setErrorMsg(error.response?.data?.message || 'Failed to file complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardContainer>
      <Content>
        <WelcomeSection>
          <WelcomeTitle>Welcome, {user.name}</WelcomeTitle>
          <WelcomeSubtitle>Track your complaints and get legal assistance</WelcomeSubtitle>
          <Button onClick={openComplaintModal}>File New Complaint</Button>
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
          <SectionTitle>Your Complaints</SectionTitle>
          {loading ? (
            <EmptyState>Loading complaints...</EmptyState>
          ) : complaints.length === 0 ? (
            <EmptyState>
              <p>You haven't filed any complaints yet.</p>
              <Button onClick={openComplaintModal} style={{ marginTop: '1rem' }}>
                File Your First Complaint
              </Button>
            </EmptyState>
          ) : (
            <ComplaintsList>
              {complaints.map(complaint => (
                <ComplaintCard 
                  key={complaint.id} 
                  onClick={() => handleComplaintClick(complaint)}
                >
                  <ComplaintTitle>{formatComplaintId(complaint.id)}</ComplaintTitle>
                  <ComplaintDate>{formatDate(complaint.filedAt)}</ComplaintDate>
                  <ComplaintPreview>{complaint.text}</ComplaintPreview>
                  <StatusBadge status={complaint.status}>
                    {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                  </StatusBadge>
                </ComplaintCard>
              ))}
            </ComplaintsList>
          )}
        </ComplaintsSection>
      </Content>

      {selectedComplaint && (
        <ComplaintDetailsModal
          complaint={selectedComplaint}
          isOpen={true}
          onClose={handleCloseModal}
          userRole="victim"
        />
      )}

      {/* New Complaint Modal */}
      {showModal && (
        <Modal onClick={closeComplaintModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <CloseButton onClick={closeComplaintModal}>&times;</CloseButton>
            <h2>File a New Complaint</h2>
            <p>Please provide details about your complaint below.</p>
            
            {errorMsg && (
              <div style={{ 
                backgroundColor: '#f8d7da', 
                color: '#721c24', 
                padding: '0.75rem', 
                marginBottom: '1rem', 
                borderRadius: '0.25rem' 
              }}>
                {errorMsg}
              </div>
            )}
            
            <Form onSubmit={handleComplaintSubmit}>
              <FormGroup>
                <Label htmlFor="language">Language</Label>
                <Select 
                  id="language" 
                  value={language} 
                  onChange={e => setLanguage(e.target.value)}
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Bengali">Bengali</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="complaint">Your Complaint</Label>
                <TextArea 
                  id="complaint" 
                  value={newComplaint} 
                  onChange={e => setNewComplaint(e.target.value)}
                  placeholder="Please describe what happened in detail. Include information like when and where the incident occurred, who was involved, and any other relevant details."
                  required
                />
              </FormGroup>
              
              <SubmitButton type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Complaint'}
              </SubmitButton>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </DashboardContainer>
  );
};

export default VictimDashboard;