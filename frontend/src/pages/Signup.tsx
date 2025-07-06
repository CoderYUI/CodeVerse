import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import '../styles/Signup.css';

const SignupContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  padding: 2rem;
`;

const SignupForm = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #1a237e;
  margin-bottom: 2rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Input = styled.input`
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #1a237e;
    outline: none;
  }
`;

const RoleToggle = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const RoleButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 1rem;
  border: 2px solid ${props => props.active ? '#1a237e' : '#e0e0e0'};
  border-radius: 10px;
  background: ${props => props.active ? '#1a237e' : 'white'};
  color: ${props => props.active ? 'white' : '#1a237e'};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #1a237e;
  }
`;

const SubmitButton = styled.button`
  padding: 1rem;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #283593;
  }
`;

const LoginLink = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  color: #666;

  a {
    color: #1a237e;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'victim'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify({
      name: formData.name,
      email: formData.email,
      role: formData.role
    }));
    
    // Redirect to appropriate dashboard
    navigate(`/dashboard/${formData.role}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (role: string) => {
    setFormData({
      ...formData,
      role
    });
  };

  return (
    <SignupContainer>
      <SignupForm>
        <Title>Create Account</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <RoleToggle>
            <RoleButton
              type="button"
              active={formData.role === 'victim'}
              onClick={() => handleRoleChange('victim')}
            >
              Victim
            </RoleButton>
            <RoleButton
              type="button"
              active={formData.role === 'police'}
              onClick={() => handleRoleChange('police')}
            >
              Police Officer
            </RoleButton>
          </RoleToggle>
          <SubmitButton type="submit">Sign Up</SubmitButton>
        </Form>
        <LoginLink>
          Already have an account? <a href="/login">Log in</a>
        </LoginLink>
      </SignupForm>
    </SignupContainer>
  );
};

export default Signup; 