import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import '../styles/Home.css';
import ladyJustice from '../images/ladyjustice.png';
import AOS from 'aos';
import 'aos/dist/aos.css';

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
  overflow-x: hidden;
`;

const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f4ff 0%, #e5ecff 100%);
  padding: 0;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 50%;
    height: 100%;
    background: rgba(26, 35, 126, 0.03);
    clip-path: polygon(20% 0, 100% 0%, 100% 100%, 0% 100%);
    z-index: 0;
  }
  
  @media (max-width: 900px) {
    flex-direction: column;
    padding: 6rem 1.5rem 5rem;
    min-height: auto;
  }
`;

const HeroContent = styled.div`
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
  padding: 0 2rem;
  
  @media (max-width: 900px) {
    flex-direction: column-reverse;
    padding: 0 1rem;
  }
`;

const HeroLeft = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding-right: 3rem;
  max-width: 650px;
  position: relative;
  z-index: 2;
  
  @media (max-width: 900px) {
    align-items: center;
    text-align: center;
    padding-right: 0;
    margin-top: 3rem;
  }
`;

const HeroRight = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 320px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(26,35,126,0.08) 0%, rgba(255,255,255,0) 70%);
    border-radius: 50%;
    z-index: -1;
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 200px;
    height: 200px;
    background: rgba(57, 73, 171, 0.1);
    border-radius: 50%;
    filter: blur(60px);
    z-index: -1;
    animation: float 8s infinite ease-in-out;
  }
  
  @keyframes float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(20px, -20px) scale(1.05); }
  }
  
  @media (max-width: 900px) {
    min-width: 0;
    margin-bottom: 0;
  }
`;

const HeroHeadline = styled.h1`
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.1;
  letter-spacing: -1px;
  background: linear-gradient(90deg, #1a237e, #5c6bc0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, #ff5722, #ff9800);
    border-radius: 4px;
  }
  
  @media (max-width: 900px) {
    font-size: 3rem;
    
    &::after {
      left: 50%;
      transform: translateX(-50%);
    }
  }
  
  @media (max-width: 480px) {
    font-size: 2.5rem;
  }
`;

const HeroSubheading = styled.p`
  font-size: 1.4rem;
  color: #3f51b5;
  margin: 2rem 0;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-left: auto;
    margin-right: auto;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const HeroImageWrapper = styled.div`
  position: relative;
  border-radius: 24px;
  
  &::before {
    content: '';
    position: absolute;
    top: -15px;
    right: -15px;
    width: 100%;
    height: 100%;
    border: 2px dashed rgba(26,35,126,0.3);
    border-radius: 24px;
    z-index: -1;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: -15px;
    width: 100%;
    height: 100%;
    border: 2px dashed rgba(255,87,34,0.3);
    border-radius: 24px;
    z-index: -1;
  }
`;

const HeroImage = styled.img`
  width: 450px;
  height: 450px;
  object-fit: cover;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(26,35,126,0.15);
  transform: rotate(-2deg);
  transition: transform 0.5s ease;
  border: 5px solid white;
  z-index: 2;
  
  &:hover {
    transform: rotate(0deg) scale(1.02);
  }
  
  @media (max-width: 1200px) {
    width: 400px;
    height: 400px;
  }
  
  @media (max-width: 768px) {
    width: 350px;
    height: 350px;
  }
  
  @media (max-width: 480px) {
    width: 280px;
    height: 280px;
  }
`;

const CTAWrapper = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const CTAButton = styled.button`
  padding: 1.2rem 3.5rem;
  font-size: 1.4rem;
  background: linear-gradient(135deg, #1a237e, #3949ab);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: 0 6px 15px rgba(26,35,126,0.2);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(26,35,126,0.3);
    background: linear-gradient(135deg, #283593, #3f51b5);
  }

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.3);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1, 1) translate(-50%);
    transform-origin: 50% 50%;
  }

  &:hover::after {
    animation: ripple 1s ease-out;
  }
  
  @keyframes ripple {
    0% {
      transform: scale(0, 0);
      opacity: 0.5;
    }
    100% {
      transform: scale(30, 30);
      opacity: 0;
    }
  }
  
  @media (max-width: 768px) {
    padding: 1rem 3rem;
    font-size: 1.2rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.8rem 2.5rem;
    font-size: 1.1rem;
  }
`;

const SecondaryButton = styled.button`
  padding: 1.2rem 2.5rem;
  font-size: 1.4rem;
  background: transparent;
  color: #1a237e;
  border: 2px solid #1a237e;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    transition: transform 0.3s ease;
  }
  
  &:hover {
    background: rgba(26,35,126,0.05);
    transform: translateY(-3px);
    
    svg {
      transform: translateX(3px);
    }
  }
  
  @media (max-width: 768px) {
    padding: 1rem 2rem;
    font-size: 1.2rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.8rem 1.8rem;
    font-size: 1.1rem;
  }
`;

const HeroDecoration = styled.div`
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255,87,34,0.1), rgba(255,152,0,0.1));
  top: 10%;
  left: 5%;
  z-index: 0;
  filter: blur(60px);
`;

const ScrollDown = styled.button`
  position: absolute;
  left: 50%;
  bottom: 2rem;
  transform: translateX(-50%);
  background: white;
  border: none;
  outline: none;
  cursor: pointer;
  z-index: 2;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  animation: bounce 2s infinite;
  
  svg {
    width: 24px;
    height: 24px;
    color: #1a237e;
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    transform: translateY(3px);
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(10px); }
  }
  
  @media (max-width: 768px) {
    bottom: 1rem;
  }
`;

const HeroToVisionSpacer = styled.div`
  height: 8rem;
  background: linear-gradient(to bottom, #f0f4ff, #ffffff);
  
  @media (max-width: 768px) {
    height: 5rem;
  }
`;

const Section = styled.section`
  padding: 5rem 2rem 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto 3rem auto;
  position: relative;
  background: white;
  border-radius: 20px;
  box-shadow: 0 5px 15px rgba(26,35,126,0.08);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 6px;
    background: linear-gradient(90deg, #1a237e, #3949ab);
  }
  
  @media (max-width: 768px) {
    padding: 4rem 1.5rem 3rem 1.5rem;
    margin-bottom: 2.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 3rem 1rem 2rem 1rem;
    margin-bottom: 2rem;
  }
`;

const VisionSection = styled(Section)`
  text-align: center;
  padding: 4rem 2rem;
  max-width: 900px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 6px;
    background: linear-gradient(90deg, #3949ab, #1a237e);
  }
`;

const VisionTitle = styled.h2`
  font-size: 2.5rem;
  color: #1a237e;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 800;
  position: relative;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const VisionText = styled.p`
  font-size: 1.3rem;
  color: #333;
  line-height: 1.7;
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  color: #1a237e;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 800;
  position: relative;
  padding-bottom: 1rem;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, #1a237e, #3949ab);
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const SectionText = styled.p`
  font-size: 1.2rem;
  color: #444;
  margin-bottom: 2rem;
  line-height: 1.7;
  text-align: center;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const CoreValuesContainer = styled.div`
  max-width: 800px;
  margin: 2.5rem auto 0 auto;
  padding: 0;
`;

const CoreValuesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
`;

const CoreValue = styled.div`
  font-size: 1.1rem;
  color: #222;
  font-weight: 500;
  padding: 1.5rem;
  border-radius: 12px;
  background-color: #f8f9fa;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(26,35,126,0.1);
  }
`;

const CoreValueTitle = styled.h3`
  color: #1a237e;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: #1a237e;
    border-radius: 50%;
    margin-right: 0.8rem;
  }
`;

const CoreValueText = styled.p`
  margin: 0;
  line-height: 1.5;
  padding-left: 1.6rem;
`;

const Footer = styled.footer`
  background: linear-gradient(135deg, #1a237e, #283593);
  color: white;
  padding: 4rem 2rem 1.5rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 6px;
    background: linear-gradient(90deg, #ff5722, #ff9800);
  }
`;

const FooterWave = styled.div`
  position: absolute;
  top: -50px;
  left: 0;
  width: 100%;
  height: 50px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z' fill='%23ffffff'/%3E%3C/svg%3E");
  background-size: cover;
  background-repeat: no-repeat;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 3rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const FooterSection = styled.div`
  h3 {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    font-weight: 600;
    position: relative;
    padding-bottom: 0.8rem;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 40px;
      height: 2px;
      background-color: #ff5722;
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin-bottom: 0.8rem;
    font-size: 0.95rem;
    transition: transform 0.2s ease;
    display: flex;
    align-items: center;
    
    &:hover {
      transform: translateX(5px);
    }
    
    &::before {
      content: '→';
      margin-right: 0.5rem;
      color: #ff5722;
    }
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

const FooterLogo = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  
  h2 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 700;
    background: linear-gradient(90deg, #ffffff, #e0e0e0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  span {
    color: #ff5722;
    margin-right: 0.5rem;
    font-size: 1.4rem;
  }
`;

const FooterAbout = styled.p`
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const FooterSocial = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const SocialIcon = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: white;
  transition: all 0.3s ease;
  
  &:hover {
    background: #ff5722;
    transform: translateY(-3px);
  }
`;

const Copyright = styled.div`
  text-align: center;
  padding-top: 1.5rem;
  margin-top: 3rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const MainCTAButton = styled.button`
  padding: 1.2rem 3.5rem;
  font-size: 1.4rem;
  background: linear-gradient(135deg, #1a237e, #283593);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: 0 6px 15px rgba(26,35,126,0.2);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(26,35,126,0.3);
    background: linear-gradient(135deg, #283593, #3949ab);
  }

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.3);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1, 1) translate(-50%);
    transform-origin: 50% 50%;
  }

  &:hover::after {
    animation: ripple 1s ease-out;
  }
  
  @keyframes ripple {
    0% {
      transform: scale(0, 0);
      opacity: 0.5;
    }
    100% {
      transform: scale(30, 30);
      opacity: 0;
    }
  }
  
  @media (max-width: 768px) {
    padding: 1rem 3rem;
    font-size: 1.2rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.8rem 2.5rem;
    font-size: 1.1rem;
  }
`;

const SectionContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.5rem;
  margin-top: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const Card = styled.div`
  background: #f8f9fa;
  padding: 2.5rem 1.5rem;
  border-radius: 20px;
  box-shadow: 0 5px 15px rgba(26,35,126,0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: box-shadow 0.4s ease, transform 0.4s ease;
  border: 1px solid #eaeaea;
  
  &:hover {
    box-shadow: 0 15px 30px rgba(26,35,126,0.12);
    transform: translateY(-10px);
    border-color: #d0d7ff;
  }
`;

const CardIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1.5rem;
  color: #1a237e;
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(26,35,126,0.08);
  border-radius: 50%;
  
  &::after {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border-radius: 50%;
    border: 2px dashed rgba(26,35,126,0.2);
    animation: spin 20s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const CardTitle = styled.h3`
  font-size: 1.5rem;
  color: #1a237e;
  margin-bottom: 1rem;
  font-weight: 700;
`;

const CardText = styled.p`
  color: #444;
  font-size: 1.05rem;
  line-height: 1.6;
`;

const HowItWorksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;
  margin: 3rem auto 0;
  max-width: 1200px;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const HowItWorksCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2.5rem 2rem;
  box-shadow: 0 5px 20px rgba(26,35,126,0.08);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  border: 1px solid #eaeaea;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, #1a237e, #3949ab);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s ease;
  }

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(26,35,126,0.15);
    border-color: #d0d7ff;
    
    &::before {
      transform: scaleX(1);
    }
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

const StepNumber = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 30px;
  height: 30px;
  background: #1a237e;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;
  margin: 3rem auto 0;
  max-width: 1200px;
  
  @media (max-width: 992px) {
    grid-template-column  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2.5rem 2rem;
  box-shadow: 0 5px 20px rgba(26,35,126,0.08);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: 100%;
  border: 1px solid #eaeaea;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(26,35,126,0.15);
    border-color: #d0d7ff;
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
  margin-bottom: 1.5rem;
  transition: transform 0.3s ease;

  svg {
    width: 40px;
    height: 40px;
    color: #1a237e;
  }
  
  ${FeatureCard}:hover & {
    transform: scale(1.1);
    background: linear-gradient(135deg, #e8eaf6, #c5cae9);
  }
`;

const Home: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize AOS animation library with reduced durations for smoother transitions
    AOS.init({
      duration: 600, // Reduced from 800
      easing: 'ease-out',
      once: true,
      offset: 50  // Smaller offset to trigger animations sooner
    });
  }, []);

  const handleTryNow = () => {
    navigate('/login');
  };

  const handleLearnMore = () => {
    const el = document.getElementById('vision-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <HomeContainer>
      <HeroSection>
        <HeroDecoration />
        <HeroContent>
          <HeroLeft data-aos="fade-right" data-aos-duration="500">
            <HeroHeadline>AI Legal Copilot for FIR Filing</HeroHeadline>
            <HeroSubheading>
              NyayaCop bridges the gap between citizens and law enforcement. Instantly analyze complaints, get legal section suggestions, and file FIRs with confidence—powered by AI.
            </HeroSubheading>
            <CTAWrapper>
              <MainCTAButton onClick={handleTryNow}>Try Now</MainCTAButton>
              <SecondaryButton onClick={handleLearnMore}>
                Learn More
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3V13M8 13L13 8M8 13L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </SecondaryButton>
            </CTAWrapper>
          </HeroLeft>
          <HeroRight data-aos="fade-left" data-aos-duration="500">
            <HeroImageWrapper>
              <HeroImage src={ladyJustice} alt="Lady Justice" />
            </HeroImageWrapper>
          </HeroRight>
        </HeroContent>
        <ScrollDown onClick={handleLearnMore} aria-label="Scroll to Our Vision">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14m0 0l-7-7m7 7l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ScrollDown>
      </HeroSection>
      
      <HeroToVisionSpacer />

      <VisionSection id="vision-section" data-aos="fade-up" data-aos-duration="500">
        <VisionTitle>Our Vision</VisionTitle>
        <VisionText>
          To be a globally recognized legal tech platform pioneering transformative legal services through innovation and excellence, making justice accessible to all citizens.
        </VisionText>
      </VisionSection>
      
      <Section data-aos="fade-up" data-aos-duration="500">
        <SectionTitle>Our Core Values</SectionTitle>
        <CoreValuesContainer>
          <CoreValuesList>
            <CoreValue data-aos="fade-up" data-aos-duration="400" data-aos-delay="50">
              <CoreValueTitle>Integrity</CoreValueTitle>
              <CoreValueText>We uphold the highest ethical standards in all our interactions and services.</CoreValueText>
            </CoreValue>
            
            <CoreValue data-aos="fade-up" data-aos-duration="400" data-aos-delay="100">
              <CoreValueTitle>Professionalism</CoreValueTitle>
              <CoreValueText>Delivering expert legal solutions with attention to detail and commitment to excellence.</CoreValueText>
            </CoreValue>
            
            <CoreValue data-aos="fade-up" data-aos-duration="400" data-aos-delay="150">
              <CoreValueTitle>Innovation</CoreValueTitle>
              <CoreValueText>Embracing creativity and cutting-edge technology to improve the legal experience.</CoreValueText>
            </CoreValue>
            
            <CoreValue data-aos="fade-up" data-aos-duration="400" data-aos-delay="200">
              <CoreValueTitle>Client-Centric</CoreValueTitle>
              <CoreValueText>Prioritizing your unique needs and ensuring accessibility to legal assistance.</CoreValueText>
            </CoreValue>
            
            <CoreValue data-aos="fade-up" data-aos-duration="400" data-aos-delay="250">
              <CoreValueTitle>Excellence</CoreValueTitle>
              <CoreValueText>Striving for unmatched quality in every aspect of our service delivery.</CoreValueText>
            </CoreValue>
            
            <CoreValue data-aos="fade-up" data-aos-duration="400" data-aos-delay="300">
              <CoreValueTitle>Accessibility</CoreValueTitle>
              <CoreValueText>Ensuring legal services are available to all citizens regardless of background or circumstance.</CoreValueText>
            </CoreValue>
          </CoreValuesList>
        </CoreValuesContainer>
      </Section>

      <Section data-aos="fade-up" data-aos-duration="500">
        <SectionTitle>Why NyayaCop?</SectionTitle>
        <SectionContent>
          <Card data-aos="fade-up" data-aos-delay="100">
            <CardIcon>🧩</CardIcon>
            <CardTitle>The Problem</CardTitle>
            <CardText>
              In India, there's a critical gap in legal expertise at the FIR level. Many police stations lack immediate access to legal experts, leading to incorrect FIRs and delayed justice.
            </CardText>
          </Card>
          <Card data-aos="fade-up" data-aos-delay="200">
            <CardIcon>🤖</CardIcon>
            <CardTitle>The AI Solution</CardTitle>
            <CardText>
              Our AI-powered platform bridges this gap by providing instant legal assistance, ensuring accurate FIRs and faster justice delivery for all citizens.
            </CardText>
          </Card>
          <Card data-aos="fade-up" data-aos-delay="300">
            <CardIcon>⚡</CardIcon>
            <CardTitle>Real Impact</CardTitle>
            <CardText>
              By combining AI with legal expertise, we're transforming how FIRs are filed and processed, making justice more accessible, efficient and equitable.
            </CardText>
          </Card>
        </SectionContent>
      </Section>

      <Section data-aos="fade-up" data-aos-duration="500">
        <SectionTitle>How This Works</SectionTitle>
        <SectionText>
          Our platform makes it easy to report and track your case from start to finish
        </SectionText>
        <HowItWorksGrid>
          <HowItWorksCard data-aos="fade-up" data-aos-delay="100">
            <StepNumber>1</StepNumber>
            <CardIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </CardIcon>
            <h3>File Your Complaint</h3>
            <p>Fill out our simple form to submit your complaint with all necessary details</p>
          </HowItWorksCard>

          <HowItWorksCard data-aos="fade-up" data-aos-delay="200">
            <StepNumber>2</StepNumber>
            <CardIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </CardIcon>
            <h3>Track Progress</h3>
            <p>Monitor your case status and receive updates in real-time</p>
          </HowItWorksCard>

          <HowItWorksCard data-aos="fade-up" data-aos-delay="300">
            <StepNumber>3</StepNumber>
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

      <Section data-aos="fade-up" data-aos-duration="500">
        <SectionTitle>Who is it for?</SectionTitle>
        <SectionText>
          Our platform serves various stakeholders in the legal system
        </SectionText>
        <FeaturesGrid>
          <FeatureCard data-aos="fade-up" data-aos-delay="100">
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </FeatureIcon>
            <h3>Victims</h3>
            <p>File complaints and track your case progress with ease, ensuring your voice is heard</p>
          </FeatureCard>

          <FeatureCard data-aos="fade-up" data-aos-delay="200">
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </FeatureIcon>
            <h3>Police Officers</h3>
            <p>Manage and process complaints efficiently with AI-powered legal section identification</p>
          </FeatureCard>

          <FeatureCard data-aos="fade-up" data-aos-delay="300">
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </FeatureIcon>
            <h3>Legal Experts</h3>
            <p>Provide guidance and support to victims with enhanced information and tools</p>
          </FeatureCard>
        </FeaturesGrid>
      </Section>

      <Section data-aos="fade-up" data-aos-duration="500">
        <SectionTitle>Key Features</SectionTitle>
        <SectionText>
          Discover what makes our platform unique and effective
        </SectionText>
        <FeaturesGrid>
          <FeatureCard data-aos="fade-up" data-aos-delay="100">
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </FeatureIcon>
            <h3>Secure Platform</h3>
            <p>Your data is protected with advanced security measures and encryption protocols</p>
          </FeatureCard>

          <FeatureCard data-aos="fade-up" data-aos-delay="200">
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </FeatureIcon>
            <h3>Real-time Updates</h3>
            <p>Stay informed about your case progress with instant notifications and status changes</p>
          </FeatureCard>

          <FeatureCard data-aos="fade-up" data-aos-delay="300">
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </FeatureIcon>
            <h3>Expert Support</h3>
            <p>Get guidance from experienced legal professionals through every step of your case</p>
          </FeatureCard>
        </FeaturesGrid>
      </Section>

      <Footer>
        <FooterWave />
        <FooterContent>
          <FooterSection data-aos="fade-up" data-aos-duration="400">
            <FooterLogo>
              <span>⚖️</span>
              <h2>NyayaCop</h2>
            </FooterLogo>
            <FooterAbout>
              NyayaCop is an AI-powered legal platform that revolutionizes FIR filing and complaint management, connecting citizens with law enforcement efficiently.
            </FooterAbout>
            <FooterSocial>
              <SocialIcon href="https://twitter.com/nyayacop" target="_blank" rel="noopener noreferrer">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                </svg>
              </SocialIcon>
              <SocialIcon href="https://github.com/nyayacop" target="_blank" rel="noopener noreferrer">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                </svg>
              </SocialIcon>
              <SocialIcon href="https://linkedin.com/in/nyayacop" target="_blank" rel="noopener noreferrer">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                </svg>
              </SocialIcon>
            </FooterSocial>
          </FooterSection>
          
          <FooterSection data-aos="fade-up" data-aos-duration="400" data-aos-delay="100">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/about">About Us</a></li>
              <li><a href="/legal-guide">Legal Guide</a></li>
              <li><a href="/find-police-station">Find Police Station</a></li>
            </ul>
          </FooterSection>
          
          <FooterSection data-aos="fade-up" data-aos-duration="400" data-aos-delay="150">
            <h3>Legal Resources</h3>
            <ul>
              <li><a href="/legal-sections">IPC Sections</a></li>
              <li><a href="/victim-rights">Victim Rights</a></li>
              <li><a href="/faq">FAQs</a></li>
              <li><a href="/privacy-policy">Privacy Policy</a></li>
            </ul>
          </FooterSection>
          
          <FooterSection data-aos="fade-up" data-aos-duration="400" data-aos-delay="200">
            <h3>Contact</h3>
            <ul>
              <li>contact@nyayacop.com</li>
              <li>Phone: +91-1234567890</li>
              <li>Bhopal, India</li>
            </ul>
          </FooterSection>
        </FooterContent>
        
        <Copyright>
          © {new Date().getFullYear()} NyayaCop. All rights reserved. Made with ❤️ by Team Infinite Loopers
        </Copyright>
      </Footer>
    </HomeContainer>
  );
};

export default Home;