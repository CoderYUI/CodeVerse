import React from 'react';
import '../styles/Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>NyayaCop</h3>
          <p>Built for Smart India Hackathon 2025</p>
        </div>
        <div className="footer-section">
          <h4>Links</h4>
          <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="#team">Team Info</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: contact@nyayacop.com</p>
          <p>Phone: +91 XXXXXXXXXX</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 NyayaCop. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 