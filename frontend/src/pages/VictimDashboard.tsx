import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import type { Complaint } from '../types';
import { mockComplaints } from '../data/mockData';
import '../styles/Dashboard.css';

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

const VictimDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }

    // Load mock complaints
    setComplaints(mockComplaints);
  }, [navigate]);

  const handleNewComplaint = () => {
    navigate('/analyze');
  };

  const handleComplaintClick = (complaint: Complaint) => {
    // Navigate to complaint details
    navigate(`/complaints/${complaint.id}`);
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
                  <p>{complaint.text}</p>
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
        </ComplaintsSection>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <ActionButton onClick={handleNewComplaint}>
            File New Complaint
          </ActionButton>
        </div>
      </Content>
    </DashboardContainer>
  );
};

export default VictimDashboard; 