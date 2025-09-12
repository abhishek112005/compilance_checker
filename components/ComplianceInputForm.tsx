import React, { useState } from 'react';
import GlassyCard from './GlassyCard';

interface ComplianceInputFormProps {
  onSubmit: (apiJson: string, ocrText: string) => void;
}

const ComplianceInputForm: React.FC<ComplianceInputFormProps> = ({ onSubmit }) => {
  const [apiJson, setApiJson] = useState('');
  const [ocrText, setOcrText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(apiJson, ocrText);
  };

  return (
    <GlassyCard title="Product Data Input">
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="apiJson">API JSON Data:</label>
          <textarea
            id="apiJson"
            rows={10}
            value={apiJson}
            onChange={(e) => setApiJson(e.target.value)}
            placeholder="Paste API JSON data here..."
          ></textarea>
        </div>
        <div>
          <label htmlFor="ocrText">OCR Extracted Text:</label>
          <textarea
            id="ocrText"
            rows={10}
            value={ocrText}
            onChange={(e) => setOcrText(e.target.value)}
            placeholder="Paste OCR extracted text here..."
          ></textarea>
        </div>
        <button type="submit">Check Compliance</button>
      </form>
    </GlassyCard>
  );
};

export default ComplianceInputForm;

