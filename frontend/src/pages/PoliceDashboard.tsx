import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import type { Complaint } from '../types';
import { mockComplaints } from '../data/mockData';
import '../styles/Dashboard.css';
import { complaintsAPI, authAPI } from '../utils/api';

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
  max-width: 500px;
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

const PoliceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [victimFormData, setVictimFormData] = useState({
    name: '',
    phone: '',
    address: '',
    id_proof: ''
  });
  const [registeringVictim, setRegisteringVictim] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

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

  const handleNewComplaint = () => {
    navigate('/analyze');
  };

  const handleComplaintClick = (complaint: Complaint) => {
    // Navigate to FIR report view
    navigate(`/fir-report/${complaint.id}`);
  };

  const handleRegisterVictim = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!victimFormData.name || !victimFormData.phone) {
      setError('Name and phone number are required');
      return;
    }

    setRegisteringVictim(true);
    setError(null);

    try {
      await authAPI.registerVictim(victimFormData);
      setRegisterSuccess(`${victimFormData.name} has been successfully registered.`);

      // Reset form
      setVictimFormData({
        name: '',
        phone: '',
        address: '',
        id_proof: ''
      });

      // Close modal after 3 seconds
      setTimeout(() => {
        setShowModal(false);
        setRegisterSuccess(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error registering victim:', error);
      setError(error.response?.data?.error || 'Failed to register victim. Please try again.');
      
      if (error.response?.status === 401 || error.response?.status === 422) {
        // Let the API interceptor handle the redirect
        return;
      }
    } finally {
      setRegisteringVictim(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVictimFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!user) {
    return null;
  }

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

        <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <ActionButton onClick={handleNewComplaint}>
            Analyze New Complaint
          </ActionButton>
          <ActionButton onClick={() => setShowModal(true)} style={{ background: '#4caf50' }}>
            Register Victim
          </ActionButton>
        </div>
      </Content>

      {/* Victim Registration Modal */}
      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Register Victim</ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>&times;</CloseButton>
            </ModalHeader>

            {registerSuccess && (
              <SuccessMessage>{registerSuccess}</SuccessMessage>
            )}

            {error && (
              <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>
            )}

            <Form onSubmit={handleRegisterVictim}>
              <FormField>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={victimFormData.name}
                  onChange={handleInputChange}
                  required
                />
              </FormField>

              <FormField>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={victimFormData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. 9876543210"
                  required
                />
              </FormField>

              <FormField>
                <Label htmlFor="address">Address</Label>
                <Input
                  type="text"
                  id="address"
                  name="address"
                  value={victimFormData.address}
                  onChange={handleInputChange}
                />
              </FormField>

              <FormField>
                <Label htmlFor="id_proof">ID Proof</Label>
                <Input
                  type="text"
                  id="id_proof"
                  name="id_proof"
                  value={victimFormData.id_proof}
                  onChange={handleInputChange}
                  placeholder="e.g. Aadhaar: XXXX-XXXX-1234"
                />
              </FormField>

              <ModalActions>
                <CancelButton type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </CancelButton>
                <ActionButton type="submit" disabled={registeringVictim}>
                  {registeringVictim ? 'Registering...' : 'Register Victim'}
                </ActionButton>
              </ModalActions>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </DashboardContainer>
  );
};

export default PoliceDashboard;