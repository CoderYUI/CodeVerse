import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaHome, FaSignInAlt, FaUserPlus, FaUser, FaSignOutAlt, FaFileAlt, FaQuestionCircle, FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../utils/auth';

const NavigationBar: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <NavbarContainer>
      <NavbarContent>
        <LogoContainer to="/">
          <LogoIcon>
            <FaFileAlt />
          </LogoIcon>
          <LogoText>SAARTHI</LogoText>
        </LogoContainer>
        
        <MobileMenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </MobileMenuButton>
        
        <DesktopMenu>
          <NavLink to="/" active={location.pathname === '/' ? 'true' : 'false'}>
            <FaHome /> Home
          </NavLink>
          
          <NavLink to="/help" active={location.pathname === '/help' ? 'true' : 'false'}>
            <FaQuestionCircle /> Help
          </NavLink>
          
          {user ? (
            <>
              <NavLink to={user.role === 'victim' ? '/victim' : '/police'} active={(location.pathname === '/victim' || location.pathname === '/police') ? 'true' : 'false'}>
                <FaUser /> Dashboard
              </NavLink>
              
              <NavButton onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </NavButton>
            </>
          ) : (
            <>
              <NavLink to="/login" active={location.pathname === '/login' ? 'true' : 'false'}>
                <FaSignInAlt /> Login
              </NavLink>
              
              <NavButton onClick={() => navigate('/login?tab=police')}>
                <FaUserPlus /> Police Login
              </NavButton>
            </>
          )}
        </DesktopMenu>
        
        <AnimatePresence>
          {isMenuOpen && (
            <MobileMenu
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <MobileNavLink to="/" onClick={() => setIsMenuOpen(false)}>
                <FaHome /> Home
              </MobileNavLink>
              
              <MobileNavLink to="/help" onClick={() => setIsMenuOpen(false)}>
                <FaQuestionCircle /> Help
              </MobileNavLink>
              
              {user ? (
                <>
                  <MobileNavLink to={user.role === 'victim' ? '/victim' : '/police'} onClick={() => setIsMenuOpen(false)}>
                    <FaUser /> Dashboard
                  </MobileNavLink>
                  
                  <MobileNavButton onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </MobileNavButton>
                </>
              ) : (
                <>
                  <MobileNavLink to="/login" onClick={() => setIsMenuOpen(false)}>
                    <FaSignInAlt /> Login
                  </MobileNavLink>
                  
                  <MobileNavLink to="/login?tab=police" onClick={() => setIsMenuOpen(false)}>
                    <FaUserPlus /> Police Login
                  </MobileNavLink>
                </>
              )}
            </MobileMenu>
          )}
        </AnimatePresence>
      </NavbarContent>
    </NavbarContainer>
  );
};

const NavbarContainer = styled.nav`
  background-color: #1a237e;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  height: 70px;
`;

const NavbarContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 100%;
`;

const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
`;

const LogoIcon = styled.div`
  font-size: 1.8rem;
  margin-right: 0.5rem;
  color: #ff5722;
`;

const LogoText = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
`;

const DesktopMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)<{ active: string }>`
  color: ${props => props.active === 'true' ? '#ff5722' : 'white'};
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    color: #ff5722;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const NavButton = styled.button`
  background-color: #ff5722;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #e64a19;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled(motion.div)`
  position: fixed;
  top: 70px;
  right: 0;
  bottom: 0;
  width: 250px;
  background-color: #1a237e;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  z-index: 999;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
`;

const MobileNavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    color: #ff5722;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const MobileNavButton = styled.button`
  background-color: #ff5722;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #e64a19;
  }
`;

export default NavigationBar;
