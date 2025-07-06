import React, { useState } from 'react';
import styled from 'styled-components';
import { mockLegalRights, mockIPCSections } from '../data/mockData';
import '../styles/LegalGuide.css';

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 6rem 2rem 4rem;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #1a237e;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const Section = styled.section`
  background: white;
  border-radius: 10px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  color: #1a237e;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
`;

const Accordion = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const AccordionItem = styled.div<{ isOpen: boolean }>`
  border-bottom: 1px solid #e0e0e0;
  &:last-child {
    border-bottom: none;
  }
`;

const AccordionHeader = styled.button<{ isOpen: boolean }>`
  width: 100%;
  padding: 1.5rem;
  background: ${props => props.isOpen ? '#f5f5f5' : 'white'};
  border: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const AccordionTitle = styled.h3`
  color: #1a237e;
  font-size: 1.2rem;
  margin: 0;
`;

const AccordionContent = styled.div<{ isOpen: boolean }>`
  padding: ${props => props.isOpen ? '1.5rem' : '0 1.5rem'};
  max-height: ${props => props.isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  background: ${props => props.isOpen ? '#f5f5f5' : 'white'};
`;

const SectionBadge = styled.span`
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background-color: #e8f4fc;
  color: #1a237e;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const LegalDetails = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  color: #666;
  font-weight: 500;
`;

const DetailValue = styled.span<{ type?: 'yes' | 'no' }>`
  color: ${props => {
    if (!props.type) return '#333';
    return props.type === 'yes' ? '#2ecc71' : '#e74c3c';
  }};
  font-weight: 500;
`;

const LegalGuide: React.FC = () => {
  const [openRights, setOpenRights] = useState<number[]>([]);
  const [openSections, setOpenSections] = useState<number[]>([]);

  const toggleRight = (index: number) => {
    setOpenRights(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const toggleSection = (index: number) => {
    setOpenSections(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <PageContainer>
      <Content>
        <Title>Legal Rights & Sections Guide</Title>

        <Section>
          <SectionTitle>Basic Rights of Citizens</SectionTitle>
          <Accordion>
            {mockLegalRights.map((right, index) => (
              <AccordionItem key={index}>
                <AccordionHeader
                  isOpen={openRights.includes(index)}
                  onClick={() => toggleRight(index)}
                >
                  <AccordionTitle>{right.title}</AccordionTitle>
                  <span>{openRights.includes(index) ? '−' : '+'}</span>
                </AccordionHeader>
                <AccordionContent isOpen={openRights.includes(index)}>
                  {right.section && (
                    <SectionBadge>{right.section}</SectionBadge>
                  )}
                  <Description>{right.description}</Description>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Section>

        <Section>
          <SectionTitle>Common IPC Sections</SectionTitle>
          <Accordion>
            {mockIPCSections.map((section, index) => (
              <AccordionItem key={index}>
                <AccordionHeader
                  isOpen={openSections.includes(index)}
                  onClick={() => toggleSection(index)}
                >
                  <AccordionTitle>
                    {section.number} - {section.title}
                  </AccordionTitle>
                  <span>{openSections.includes(index) ? '−' : '+'}</span>
                </AccordionHeader>
                <AccordionContent isOpen={openSections.includes(index)}>
                  <Description>{section.description}</Description>
                  <LegalDetails>
                    <DetailItem>
                      <DetailLabel>Cognizable:</DetailLabel>
                      <DetailValue type={section.isCognizable ? 'yes' : 'no'}>
                        {section.isCognizable ? 'Yes' : 'No'}
                      </DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Bailable:</DetailLabel>
                      <DetailValue type={section.isBailable ? 'yes' : 'no'}>
                        {section.isBailable ? 'Yes' : 'No'}
                      </DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Punishment:</DetailLabel>
                      <DetailValue>{section.punishment}</DetailValue>
                    </DetailItem>
                  </LegalDetails>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Section>
      </Content>
    </PageContainer>
  );
};

export default LegalGuide; 