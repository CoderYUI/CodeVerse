import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import '../styles/Navbar.css';
import { authAPI } from '../utils/api';

// Define props interface for Navbar
interface NavbarProps {
  isAuthenticated?: boolean;
  userRole?: string | null;
}

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

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [authState, setAuthState] = useState({
    isAuthenticated: isAuthenticated || false,
    userRole: userRole || null
  });

  // Update internal state when props change
  useEffect(() => {
    if (isAuthenticated !== undefined) {
      setAuthState({
        isAuthenticated: isAuthenticated,
        userRole: userRole || null
      });
    }
  }, [isAuthenticated, userRole]);

  // Also listen for auth changes directly
  useEffect(() => {
    const checkAuthFromStorage = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
          setAuthState({
            isAuthenticated: true,
            userRole: userData.role
          });
          console.log("Navbar: Auth detected from storage", userData.role);
        } catch (error) {
          console.error('Navbar: Error parsing user data', error);
          setAuthState({
            isAuthenticated: false,
            userRole: null
          });
        }
      } else {
        setUser(null);
        setAuthState({
          isAuthenticated: false,
          userRole: null
        });
        console.log("Navbar: No auth detected in storage");
      }
    };

    // Check auth on mount and path change
    checkAuthFromStorage();

    // Set up listeners for auth changes
    const handleAuthChange = () => {
      console.log("Navbar: Auth change event detected");
      checkAuthFromStorage();
    };
    
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    console.log("Logging out...");
    authAPI.logout();
    setAuthState({
      isAuthenticated: false,
      userRole: null
    });
    setUser(null);
    navigate('/');
  };

  // Use internal state for rendering
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
          
          {authState.isAuthenticated ? (
            <>
              <NavLink to={`/dashboard/${authState.userRole}`}>Dashboard</NavLink>
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