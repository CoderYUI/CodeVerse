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
  const [tokenVerified, setTokenVerified] = useState(false);

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
      // Force non-authenticated state for signup-related paths
      const pathsToForceNonAuth = ['/signup', '/register', '/signup-success'];
      const shouldForceNonAuth = pathsToForceNonAuth.some(path => location.pathname.includes(path));
      
      if (shouldForceNonAuth) {
        console.log(`Navbar: On ${location.pathname}, forcing non-authenticated state`);
        setUser(null);
        setAuthState({
          isAuthenticated: false,
          userRole: null
        });
        setTokenVerified(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        handleInvalidAuthState("No token or user data found");
        return;
      }
      
      try {
        const userData = JSON.parse(userStr);
        // Add verification that we have valid data
        if (userData && userData.role) {
          // Don't set auth state here yet - wait for token verification
          setUser(userData);
          console.log("Navbar: User data from storage found, waiting for token verification");
        } else {
          handleInvalidAuthState("Invalid user data structure");
        }
      } catch (error) {
        console.error('Navbar: Error parsing user data', error);
        handleInvalidAuthState("Error parsing user data");
      }
    };
    
    // Helper function to handle invalid auth state
    const handleInvalidAuthState = (reason = "No valid auth detected in storage") => {
      setUser(null);
      setAuthState({
        isAuthenticated: false,
        userRole: null
      });
      setTokenVerified(false);
      console.log(`Navbar: ${reason}`);
    };

    // Check auth on mount and path change
    checkAuthFromStorage();
    
    // Verify token validity with the server if we think we're logged in
    const verifyToken = async () => {
      const pathsToSkipVerification = ['/signup', '/register', '/signup-success', '/login'];
      const shouldSkipVerification = pathsToSkipVerification.some(path => 
        location.pathname.includes(path)
      );
      
      if (shouldSkipVerification) {
        console.log(`Navbar: Skipping token verification on ${location.pathname}`);
        setTokenVerified(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        handleInvalidAuthState("No token to verify");
        return;
      }
      
      try {
        console.log("Navbar: Verifying token with server");
        await authAPI.verifyToken();
        
        // Token is valid, now we can safely set the auth state
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          if (userData && userData.role) {
            setAuthState({
              isAuthenticated: true,
              userRole: userData.role
            });
            setTokenVerified(true);
            console.log(`Navbar: Token verified, user authenticated as ${userData.role}`);
          }
        }
      } catch (error) {
        console.log("Navbar: Token verification failed, clearing auth state");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        handleInvalidAuthState("Token verification failed");
      }
    };
    
    // Run token verification
    verifyToken();

    // Set up listeners for auth changes
    const handleAuthChange = () => {
      console.log("Navbar: Auth change event detected");
      checkAuthFromStorage();
      verifyToken();
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
    setTokenVerified(false);
    navigate('/');
  };

  // Check if path should always show login/signup
  const forceLoginDisplay = location.pathname.includes('/signup') || 
                         location.pathname.includes('/register') || 
                         location.pathname.includes('/signup-success');
  
  // Only show logged-in UI if:
  // 1. We're authenticated according to state AND
  // 2. Token has been verified with the server AND
  // 3. We're not on a signup/register page
  const showAuthUI = authState.isAuthenticated && tokenVerified && !forceLoginDisplay;

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
          
          {showAuthUI ? (
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