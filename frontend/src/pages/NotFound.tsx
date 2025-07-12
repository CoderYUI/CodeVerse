import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 0 2rem;
  background-color: #f8f9fa;
`;

const ErrorCode = styled.h1`
  font-size: 8rem;
  font-weight: 800;
  color: #1a237e;
  margin: 0;
  line-height: 1;
  
  @media (max-width: 768px) {
    font-size: 6rem;
  }
`;

const ErrorMessage = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin: 1rem 0 2rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const GoBackButton = styled(Link)`
  padding: 1rem 2rem;
  background-color: #1a237e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #0d1757;
    transform: translateY(-3px);
  }
`;

const NotFound: React.FC = () => {
  return (
    <NotFoundContainer>
      <ErrorCode>404</ErrorCode>
      <ErrorMessage>Oops! Page not found</ErrorMessage>
      <p style={{ marginBottom: '2rem', textAlign: 'center', maxWidth: '600px' }}>
        The page you're looking for doesn't exist or has been moved. Let's get you back on track.
      </p>
      <GoBackButton to="/">Return to Homepage</GoBackButton>
    </NotFoundContainer>
  );
};

export default NotFound;
