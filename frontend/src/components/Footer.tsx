import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaFileAlt, FaTwitter, FaFacebook, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterLogo>
            <LogoIcon>
              <FaFileAlt />
            </LogoIcon>
            <LogoText>SAARTHI</LogoText>
          </FooterLogo>
          <FooterDescription>
            Empowering citizens with accessible legal assistance and simplified FIR filing through AI-powered technology.
          </FooterDescription>
          <SocialLinks>
            <SocialLink href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </SocialLink>
            <SocialLink href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook />
            </SocialLink>
            <SocialLink href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </SocialLink>
            <SocialLink href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin />
            </SocialLink>
          </SocialLinks>
        </FooterSection>
        
        <FooterSection>
          <FooterSectionTitle>Quick Links</FooterSectionTitle>
          <FooterLinks>
            <FooterLink to="/">Home</FooterLink>
            <FooterLink to="/about">About Us</FooterLink>
            <FooterLink to="/help">Help Center</FooterLink>
            <FooterLink to="/login">File a Complaint</FooterLink>
            <FooterLink to="/track">Track Complaint</FooterLink>
          </FooterLinks>
        </FooterSection>
        
        <FooterSection>
          <FooterSectionTitle>Legal Resources</FooterSectionTitle>
          <FooterLinks>
            <FooterLink to="/ipc-sections">IPC Sections</FooterLink>
            <FooterLink to="/legal-rights">Know Your Rights</FooterLink>
            <FooterLink to="/police-stations">Police Stations</FooterLink>
            <FooterLink to="/faq">FAQs</FooterLink>
            <FooterLink to="/privacy-policy">Privacy Policy</FooterLink>
          </FooterLinks>
        </FooterSection>
        
        <FooterSection>
          <FooterSectionTitle>Contact Us</FooterSectionTitle>
          <ContactItem>
            <FaEnvelope />
            <ContactText>support@saarthi.org</ContactText>
          </ContactItem>
          <ContactItem>
            <FaPhone />
            <ContactText>+91-1234567890</ContactText>
          </ContactItem>
          <ContactItem>
            <FaMapMarkerAlt />
            <ContactText>123 Legal Avenue, New Delhi, India</ContactText>
          </ContactItem>
        </FooterSection>
      </FooterContent>
      
      <FooterBottom>
        <CopyrightText>
          &copy; {currentYear} SAARTHI. All rights reserved.
        </CopyrightText>
        <FooterBottomLinks>
          <FooterBottomLink to="/terms">Terms of Service</FooterBottomLink>
          <FooterBottomLink to="/privacy">Privacy Policy</FooterBottomLink>
          <FooterBottomLink to="/cookies">Cookie Policy</FooterBottomLink>
        </FooterBottomLinks>
      </FooterBottom>
    </FooterContainer>
  );
};

const FooterContainer = styled.footer`
  background-color: #1a237e;
  color: white;
  padding-top: 4rem;
`;

const FooterContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const FooterSection = styled.div`
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const FooterLogo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const LogoIcon = styled.div`
  font-size: 1.8rem;
  margin-right: 0.5rem;
  color: #ff5722;
`;

const LogoText = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
`;

const FooterDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const SocialLink = styled.a`
  color: white;
  font-size: 1.2rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: #ff5722;
  }
`;

const FooterSectionTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 0.5rem;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 2px;
    background-color: #ff5722;
    
    @media (max-width: 768px) {
      left: 50%;
      transform: translateX(-50%);
    }
  }
`;

const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const FooterLink = styled(Link)`
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.3s ease;
  
  &:hover {
    color: #ff5722;
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.8rem;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ContactText = styled.span`
  margin-left: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
`;

const FooterBottom = styled.div`
  background-color: #121858;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const CopyrightText = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const FooterBottomLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const FooterBottomLink = styled(Link)`
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: #ff5722;
  }
`;

export default Footer;