import styled from 'styled-components';
import React from 'react';

// Create a component that properly handles boolean props
interface RoleButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const StyledRoleButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 1rem;
  border: none;
  background-color: ${props => props.$active ? '#1a237e' : 'white'};
  color: ${props => props.$active ? 'white' : '#333'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.$active ? '#1a237e' : '#f0f0f0'};
  }
`;

export const RoleButton = ({ active, onClick, children }: RoleButtonProps) => (
  <StyledRoleButton type="button" $active={active} onClick={onClick}>
    {children}
  </StyledRoleButton>
);

// Add other reusable styled components here
