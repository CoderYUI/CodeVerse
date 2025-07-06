import React, { useState } from 'react';
import type { Language } from '../types';
import '../styles/ComplaintForm.css';

interface ComplaintFormProps {
  onAnalyze: (complaint: string, language: Language) => void;
  onCancel: () => void;
  isCitizenMode: boolean;
  hasResults: boolean;
}

const ComplaintForm: React.FC<ComplaintFormProps> = ({
  onAnalyze,
  onCancel,
  isCitizenMode,
  hasResults
}) => {
  const [complaint, setComplaint] = useState('');
  const [language, setLanguage] = useState<Language>('English');
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint.trim()) {
      // Show error toast will be handled by parent
      return;
    }
    onAnalyze(complaint, language);
  };

  const handleVoiceInput = () => {
    setIsRecording(true);
    // Simulate voice input processing
    setTimeout(() => {
      setComplaint('This is a simulated voice input text...');
      setIsRecording(false);
    }, 2000);
  };

  const handleCancel = () => {
    setComplaint('');
    onCancel();
  };

  return (
    <form className="complaint-form" onSubmit={handleSubmit}>
      <div className="form-controls">
        <div className="language-select">
          <label htmlFor="language">Language:</label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Marathi">Marathi</option>
            <option value="Tamil">Tamil</option>
          </select>
          <span className="tooltip">Multilingual support coming soon</span>
        </div>
      </div>

      <div className="input-container">
        <textarea
          className="complaint-textarea"
          placeholder={isCitizenMode ? "What happened? Tell us your story..." : "Enter your complaint here..."}
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          rows={6}
        />
        <button
          type="button"
          className="voice-input-button"
          onClick={handleVoiceInput}
          disabled={isRecording}
          title="Use voice input"
        >
          {isRecording ? '🎤 Processing...' : '🎤'}
        </button>
      </div>

      <div className="form-buttons">
        <button type="submit" className="analyze-button">
          {isCitizenMode ? "Get Help" : "Analyze Complaint"}
        </button>
        {hasResults && (
          <button
            type="button"
            className="cancel-button"
            onClick={handleCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ComplaintForm; 