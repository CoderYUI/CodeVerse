import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import type { UserRole } from '../types';
import '../styles/Login.css';

const LoginContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const LeftPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background-color: #1a237e;
  color: white;
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const Form = styled.form`
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 2rem;
  color: #666;
`;

const RoleToggle = styled.div`
  display: flex;
  margin-bottom: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
`;

const RoleButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 1rem;
  border: none;
  background-color: ${props => props.active ? '#1a237e' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.active ? '#1a237e' : '#f0f0f0'};
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #1a237e;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: #1a237e;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #283593;
  }
`;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('victim');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate authentication
    const user = {
      id: '1',
      name: role === 'police' ? 'Inspector Rajesh Kumar' : 'Rahul Sharma',
      role,
      email
    };

    // Store user in localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    // Redirect to appropriate dashboard
    navigate(`/dashboard/${role}`);
  };

  return (
    <LoginContainer>
      <LeftPanel>
        <img src="/logo.png" alt="NyayaCop Logo" style={{ width: '200px', marginBottom: '2rem' }} />
        <h1>AI Legal Copilot for FIR Filing</h1>
        <p>Transform your legal experience with AI-powered assistance</p>
      </LeftPanel>

      <RightPanel>
        <Form onSubmit={handleSubmit}>
          <Title>Welcome Back</Title>
          <Subtitle>Sign in to continue</Subtitle>

          <RoleToggle>
            <RoleButton
              type="button"
              active={role === 'victim'}
              onClick={() => setRole('victim')}
            >
              Victim
            </RoleButton>
            <RoleButton
              type="button"
              active={role === 'police'}
              onClick={() => setRole('police')}
            >
              Police Officer
            </RoleButton>
          </RoleToggle>

          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <SubmitButton type="submit">
            Sign In
          </SubmitButton>
        </Form>
      </RightPanel>
    </LoginContainer>
  );
};

export default Login; 