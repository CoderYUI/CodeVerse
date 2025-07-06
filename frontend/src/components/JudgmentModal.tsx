import React from 'react';
import type { Judgment } from '../types';
import '../styles/JudgmentModal.css';

interface JudgmentModalProps {
  judgment: Judgment;
  onClose: () => void;
}

const JudgmentModal: React.FC<JudgmentModalProps> = ({ judgment, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 className="modal-title">{judgment.title} ({judgment.year})</h2>
        <div className="modal-citation">Citation: {judgment.citation}</div>
        <div className="modal-details">
          <h3>Case Details</h3>
          <p>{judgment.fullDetails}</p>
        </div>
        <div className="modal-key-points">
          <h3>Key Points</h3>
          <ul>
            {judgment.keyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JudgmentModal; 