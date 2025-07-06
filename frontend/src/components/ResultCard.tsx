import React from 'react';
import type { LegalSuggestion } from '../types';
import '../styles/ResultCard.css';

interface ResultCardProps {
  suggestion: LegalSuggestion;
  isCitizenMode: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ suggestion, isCitizenMode }) => {
  const getOffenseTitle = (section: string) => {
    return section.split('-')[1]?.trim() || section;
  };

  return (
    <div className="result-card">
      <div className="result-card-header">
        <h3 className="section-title">
          {isCitizenMode ? (
            getOffenseTitle(suggestion.section)
          ) : (
            suggestion.section
          )}
        </h3>
        <div className="act-badge">{suggestion.act}</div>
      </div>

      <p className="section-description">
        {isCitizenMode ? (
          `You may be protected under laws related to ${getOffenseTitle(suggestion.section).toLowerCase()}`
        ) : (
          suggestion.description
        )}
      </p>

      {!isCitizenMode && (
        <div className="legal-details">
          <div className="detail-item">
            <span className="detail-label">Cognizable:</span>
            <span className={`detail-value ${suggestion.isCognizable ? 'yes' : 'no'}`}>
              {suggestion.isCognizable ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Bailable:</span>
            <span className={`detail-value ${suggestion.isBailable ? 'yes' : 'no'}`}>
              {suggestion.isBailable ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Punishment:</span>
            <span className="detail-value">{suggestion.punishment}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultCard; 