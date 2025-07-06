import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import '../styles/Navbar.css';

const Nav = styled.nav`
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a237e;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  img {
    height: 40px;
    width: auto;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: #333;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 500;
  transition: color 0.3s ease;

  &:hover {
    color: #1a237e;
  }
`;

const AuthButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const LoginButton = styled.button`
  padding: 0.8rem 1.5rem;
  background: white;
  color: #1a237e;
  border: 2px solid #1a237e;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  font-weight: 600;
  margin-right: 0.5rem;
  &:hover {
    background: #f0f3ff;
    color: #283593;
    border-color: #283593;
    transform: translateY(-2px);
  }
`;

const SignupButton = styled.button`
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
  font-weight: 600;
  &:hover {
    background: #283593;
    transform: translateY(-2px);
  }
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

  &:hover {
    background: #283593;
    transform: translateY(-2px);
  }
`;

const ProfileButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  color: #1a237e;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.3s ease;

  &:hover {
    color: #283593;
  }
`;

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check for user in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <Nav>
      <NavContainer>
        <Logo to="/">
          <img src="/assets/nyayacop-logo.svg" alt="NyayaCop Logo" />
          NyayaCop
        </Logo>
        <NavLinks>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/legal-guide">Legal Guide</NavLink>
          <NavLink to="/find-police-station">Find Police Station</NavLink>
          {user ? (
            <>
              <NavLink to={`/dashboard/${user.role}`}>Dashboard</NavLink>
              <Button onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <AuthButtons>
              <LoginButton as={Link} to="/login">Login</LoginButton>
              <SignupButton as={Link} to="/signup">Sign Up</SignupButton>
            </AuthButtons>
          )}
        </NavLinks>
      </NavContainer>
    </Nav>
  );
};

export default Navbar; 