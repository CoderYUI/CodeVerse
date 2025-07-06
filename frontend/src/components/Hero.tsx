import React from 'react';
import '../styles/Hero.css';

const Hero: React.FC = () => {
  return (
    <section className="hero">
      <h1 className="hero-title">Your AI Legal Assistant</h1>
      <p className="hero-description">
        Enter your complaint and let NyayaCop suggest the right legal sections for your FIR
      </p>
      <button className="hero-button">Try Now</button>
    </section>
  );
};

export default Hero; 