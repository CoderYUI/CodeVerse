import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import '../styles/Home.css';
import ladyJustice from '../images/ladyjustice.png';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const HomeContainer = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const HeroSection = styled.section`
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(120deg, #f8f9fa 70%, #e3e6f3 100%);
  padding: 6rem 2rem 2rem 2rem;
  position: relative;
  @media (max-width: 900px) {
    flex-direction: column-reverse;
    padding: 3rem 1rem 1rem 1rem;
    min-height: auto;
  }
`;

const HeroLeft = styled.div`
  flex: 1.2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding-right: 2rem;
  @media (max-width: 900px) {
    align-items: center;
    padding-right: 0;
    margin-top: 2rem;
  }
`;

const HeroRight = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 320px;
  @media (max-width: 900px) {
    min-width: 0;
    margin-bottom: 2rem;
  }
`;

const HeroHeadline = styled.h1`
  font-size: 3.2rem;
  font-weight: 900;
  color: #1a237e;
  margin-bottom: 1.2rem;
  line-height: 1.1;
  letter-spacing: -1px;
  @media (max-width: 600px) {
    font-size: 2.1rem;
  }
`;

const HeroSubheading = styled.p`
  font-size: 1.3rem;
  color: #283593;
  margin-bottom: 2.2rem;
  max-width: 500px;
  line-height: 1.6;
  @media (max-width: 600px) {
    font-size: 1.05rem;
  }
`;

const HeroImage = styled.img`
  width: 340px;
  height: 340px;
  object-fit: cover;
  border-radius: 24px;
  box-shadow: 0 4px 16px rgba(26,35,126,0.07);
  background: #e0e0e0;
  @media (max-width: 500px) {
    width: 90vw;
    height: 200px;
  }
`;

const ScrollDown = styled.button`
  position: absolute;
  left: 50%;
  bottom: 2rem;
  transform: translateX(-50%);
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  z-index: 2;
  animation: bounce 2s infinite;
  svg {
    width: 36px;
    height: 36px;
    color: #1a237e;
    opacity: 0.7;
  }
  @keyframes bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(10px); }
  }
`;

const Section = styled.section`
  padding: 6rem 2rem 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  background: white;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(26,35,126,0.04);
  margin-bottom: 3rem;
  @media (max-width: 600px) {
    padding: 2.5rem 0.5rem 2rem 0.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.2rem;
  color: #1a237e;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 800;
`;

const SectionText = styled.p`
  font-size: 1.15rem;
  color: #444;
  margin-bottom: 1.5rem;
  line-height: 1.7;
  text-align: center;
`;

const CoreValuesList = styled.ul`
  margin: 2rem auto 0 auto;
  padding: 0;
  list-style: none;
  max-width: 600px;
`;

const CoreValue = styled.li`
  font-size: 1.05rem;
  color: #222;
  margin-bottom: 0.7rem;
  font-weight: 500;
  span {
    color: #1a237e;
    font-weight: 700;
    margin-right: 0.5rem;
  }
`;

const Footer = styled.footer`
  background: #1a237e;
  color: white;
  padding: 2rem 1.5rem;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
`;

const FooterSection = styled.div`
  h3 {
    font-size: 0.95rem;
    margin-bottom: 0.75rem;
    font-weight: 600;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    margin-bottom: 0.35rem;
    font-size: 0.8rem;
  }

  a {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: white;
    }
  }
`;

const Copyright = styled.div`
  text-align: center;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
`;

const CTAButton = styled.button`
  padding: 1.2rem 3.5rem;
  font-size: 1.4rem;
  background: white;
  color: #1a237e;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
  }

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(26, 35, 126, 0.2);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1, 1) translate(-50%);
    transform-origin: 50% 50%;
  }

  &:hover::after {
    animation: ripple 1s ease-out;
  }
`;

const SectionContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.5rem;
  margin-top: 2.5rem;
`;

const Card = styled.div`
  background: #f8f9fa;
  padding: 2.5rem 1.5rem;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(26,35,126,0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: box-shadow 0.3s, transform 0.3s;
  &:hover {
    box-shadow: 0 6px 18px rgba(26,35,126,0.10);
    transform: translateY(-4px) scale(1.03);
  }
`;

const CardIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1.2rem;
  color: #1a237e;
`;

const CardTitle = styled.h3`
  font-size: 1.3rem;
  color: #1a237e;
  margin-bottom: 1rem;
  font-weight: 700;
`;

const CardText = styled.p`
  color: #444;
  font-size: 1.05rem;
  line-height: 1.6;
`;

const HowItWorksSection = styled.section`
  padding: 6rem 2rem;
  background: white;
  text-align: center;
`;

const HowItWorksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin: 3rem auto 0;
  max-width: 1200px;
  padding: 0 1rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const HowItWorksCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(26,35,126,0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(26,35,126,0.12);
  }

  h3 {
    color: #1a237e;
    font-size: 1.5rem;
    margin: 1.5rem 0 1rem;
    font-weight: 700;
  }

  p {
    color: #444;
    font-size: 1.1rem;
    line-height: 1.6;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2rem;
  margin: 3rem auto 0;
  max-width: 1200px;
  padding: 0 1rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(26,35,126,0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(26,35,126,0.12);
  }

  h3 {
    color: #1a237e;
    font-size: 1.5rem;
    margin: 1.5rem 0 1rem;
    font-weight: 700;
  }

  p {
    color: #444;
    font-size: 1.1rem;
    line-height: 1.6;
    margin: 0;
  }
`;

const FeatureIcon = styled.div`
  width: 80px;
  height: 80px;
  background: #f0f3ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;

  svg {
    width: 40px;
    height: 40px;
    color: #1a237e;
  }
`;

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleTryNow = () => {
    navigate('/login');
  };

  const scrollToVision = () => {
    const el = document.getElementById('vision-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <HeroSection>
        <HeroLeft>
          <HeroHeadline>AI Legal Copilot for FIR Filing</HeroHeadline>
          <HeroSubheading>
            NyayaCop bridges the gap between citizens and law enforcement. Instantly analyze complaints, get legal section suggestions, and file FIRs with confidence—powered by AI.
          </HeroSubheading>
          <CTAButton onClick={handleTryNow}>Try Now</CTAButton>
        </HeroLeft>
        <HeroRight>
          <HeroImage src={ladyJustice} alt="Lady Justice" />
        </HeroRight>
        <ScrollDown onClick={scrollToVision} aria-label="Scroll to Our Vision">
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14m0 0l-7-7m7 7l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </ScrollDown>
      </HeroSection>

      <Section id="vision-section">
        <SectionTitle>Our Vision</SectionTitle>
        <SectionText>
          To be a globally recognized legal tech platform pioneering transformative legal services of innovation and excellence.
        </SectionText>
      </Section>
      <Section>
        <SectionTitle>Our Core Values</SectionTitle>
        <CoreValuesList>
          <CoreValue><span>Integrity:</span> We uphold the highest ethical standards.</CoreValue>
          <CoreValue><span>Professionalism:</span> Delivering expert legal solutions.</CoreValue>
          <CoreValue><span>Innovation:</span> Embracing creativity in every case.</CoreValue>
          <CoreValue><span>Client-Centric:</span> Prioritizing your unique needs.</CoreValue>
          <CoreValue><span>Excellence:</span> Striving for unmatched quality.</CoreValue>
        </CoreValuesList>
      </Section>

      <Section>
        <SectionTitle>Why NyayaCop?</SectionTitle>
        <SectionContent>
          <Card>
            <CardIcon>🧩</CardIcon>
            <CardTitle>The Problem</CardTitle>
            <CardText>
              In India, there's a critical gap in legal expertise at the FIR level. Many police stations lack immediate access to legal experts, leading to incorrect FIRs and delayed justice.
            </CardText>
          </Card>
          <Card>
            <CardIcon>🤖</CardIcon>
            <CardTitle>The AI Solution</CardTitle>
            <CardText>
              Our AI-powered platform bridges this gap by providing instant legal assistance, ensuring accurate FIRs and faster justice delivery.
            </CardText>
          </Card>
          <Card>
            <CardIcon>⚡</CardIcon>
            <CardTitle>Real Impact</CardTitle>
            <CardText>
              By combining AI with legal expertise, we're transforming how FIRs are filed and processed, making justice more accessible and efficient.
            </CardText>
          </Card>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>How This Works</SectionTitle>
        <SectionText>
          Our platform makes it easy to report and track your case
        </SectionText>
        <HowItWorksGrid>
          <HowItWorksCard>
            <CardIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </CardIcon>
            <h3>File Your Complaint</h3>
            <p>Fill out our simple form to submit your complaint with all necessary details</p>
          </HowItWorksCard>

          <HowItWorksCard>
            <CardIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </CardIcon>
            <h3>Track Progress</h3>
            <p>Monitor your case status and receive updates in real-time</p>
          </HowItWorksCard>

          <HowItWorksCard>
            <CardIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </CardIcon>
            <h3>Get Support</h3>
            <p>Receive guidance and support from our legal experts throughout the process</p>
          </HowItWorksCard>
        </HowItWorksGrid>
      </Section>

      <Section>
        <SectionTitle>Who is it for?</SectionTitle>
        <SectionText>
          Our platform serves various stakeholders in the legal system
        </SectionText>
        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </FeatureIcon>
            <h3>Victims</h3>
            <p>File complaints and track your case progress with ease</p>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </FeatureIcon>
            <h3>Police Officers</h3>
            <p>Manage and process complaints efficiently</p>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </FeatureIcon>
            <h3>Legal Experts</h3>
            <p>Provide guidance and support to victims</p>
          </FeatureCard>
        </FeaturesGrid>
      </Section>

      <Section>
        <SectionTitle>Key Features</SectionTitle>
        <SectionText>
          Discover what makes our platform unique
        </SectionText>
        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </FeatureIcon>
            <h3>Secure Platform</h3>
            <p>Your data is protected with advanced security measures</p>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </FeatureIcon>
            <h3>Real-time Updates</h3>
            <p>Stay informed about your case progress instantly</p>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </FeatureIcon>
            <h3>Expert Support</h3>
            <p>Get guidance from experienced legal professionals</p>
          </FeatureCard>
        </FeaturesGrid>
      </Section>

      <Footer>
        <FooterContent>
          <FooterSection>
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/legal-guide">Legal Guide</a></li>
              <li><a href="/find-police-station">Find Police Station</a></li>
            </ul>
          </FooterSection>
          <FooterSection>
            <h3>Contact</h3>
            <ul>
              <li>Email: contact@nyayacop.com</li>
              <li>GitHub: github.com/nyayacop</li>
              <li>Twitter: @nyayacop</li>
            </ul>
          </FooterSection>
          <FooterSection>
            <h3>Team</h3>
            <ul>
              <li>CodeVerse Hackathon</li>
              <li>Team Infinite Loopers</li>
              <li>Made with ❤️ </li>
            </ul>
          </FooterSection>
        </FooterContent>
        <Copyright>
          © 2024 NyayaCop. All rights reserved.
        </Copyright>
      </Footer>
    </>
  );
};

export default Home; 