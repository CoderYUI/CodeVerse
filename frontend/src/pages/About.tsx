import React from 'react';
import styled, { keyframes } from 'styled-components';
import '../styles/About.css';

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

const AboutContainer = styled.div`
  padding: 6rem 2rem 4rem;
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Section = styled.section`
  background: white;
  border-radius: 10px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.6s ease-out;
`;

const Title = styled.h1`
  color: #1a237e;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const Subtitle = styled.h2`
  color: #1a237e;
  font-size: 1.8rem;
  margin: 2rem 0 1rem;
`;

const Paragraph = styled.p`
  color: #333;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const FeatureCard = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  &:hover {
    transform: translateY(-5px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #1a237e;
`;

const FeatureTitle = styled.h3`
  color: #1a237e;
  margin-bottom: 1rem;
`;

const ImpactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const ImpactCard = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const ImpactNumber = styled.div`
  font-size: 2rem;
  color: #1a237e;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const ImpactLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const About: React.FC = () => {
  return (
    <AboutContainer>
      <Content>
        <Section>
          <Title>About NyayaCop</Title>
          <Paragraph>
            NyayaCop is an innovative AI-powered legal assistant designed to bridge the gap between citizens and law enforcement. Our platform addresses critical challenges in the Indian legal system, particularly in FIR writing and legal section identification.
          </Paragraph>
        </Section>

        <Section>
          <Subtitle>The Problem</Subtitle>
          <Paragraph>
            In India, there exists a significant gap in legal knowledge and FIR writing capabilities. Many citizens struggle to articulate their complaints effectively, while police officers face challenges in identifying the correct IPC/CrPC sections.
          </Paragraph>
          <FeatureGrid>
            <FeatureCard>
              <FeatureIcon>📝</FeatureIcon>
              <FeatureTitle>Incorrect FIRs</FeatureTitle>
              <Paragraph>
                Many FIRs are filed with incorrect or missing legal sections, leading to delayed justice.
              </Paragraph>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon>⏳</FeatureIcon>
              <FeatureTitle>Delayed Justice</FeatureTitle>
              <Paragraph>
                Improper legal section identification causes unnecessary delays in case processing.
              </Paragraph>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon>👥</FeatureIcon>
              <FeatureTitle>Citizen Frustration</FeatureTitle>
              <Paragraph>
                Citizens often face difficulties in understanding and navigating the legal process.
              </Paragraph>
            </FeatureCard>
          </FeatureGrid>
        </Section>

        <Section>
          <Subtitle>Our Solution</Subtitle>
          <FeatureGrid>
            <FeatureCard>
              <FeatureIcon>🤖</FeatureIcon>
              <FeatureTitle>AI-Powered Analysis</FeatureTitle>
              <Paragraph>
                Our advanced AI system analyzes complaints in real-time, suggesting relevant IPC/CrPC sections and providing procedural guidance.
              </Paragraph>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>📋</FeatureIcon>
              <FeatureTitle>Smart FIR Generation</FeatureTitle>
              <Paragraph>
                Automated FIR generation with proper legal sections, reducing errors and saving time for both citizens and police officers.
              </Paragraph>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>📚</FeatureIcon>
              <FeatureTitle>Legal Knowledge Base</FeatureTitle>
              <Paragraph>
                Comprehensive database of legal sections, precedents, and procedural steps to ensure accurate complaint handling.
              </Paragraph>
            </FeatureCard>
          </FeatureGrid>
        </Section>

        <Section>
          <Subtitle>Our Impact</Subtitle>
          <ImpactGrid>
            <ImpactCard>
              <ImpactNumber>90%</ImpactNumber>
              <ImpactLabel>Reduction in FIR Writing Errors</ImpactLabel>
            </ImpactCard>
            <ImpactCard>
              <ImpactNumber>60%</ImpactNumber>
              <ImpactLabel>Decrease in Police Response Time</ImpactLabel>
            </ImpactCard>
            <ImpactCard>
              <ImpactNumber>85%</ImpactNumber>
              <ImpactLabel>Improved Citizen Satisfaction</ImpactLabel>
            </ImpactCard>
            <ImpactCard>
              <ImpactNumber>75%</ImpactNumber>
              <ImpactLabel>More Efficient Case Processing</ImpactLabel>
            </ImpactCard>
          </ImpactGrid>
        </Section>
      </Content>
    </AboutContainer>
  );
};

export default About; 