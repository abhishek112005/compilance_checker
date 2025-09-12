import React from 'react';
import GlassyCard from './GlassyCard';

interface ComplianceResultsDisplayProps {
  results: any | null; 
}

const ComplianceResultsDisplay: React.FC<ComplianceResultsDisplayProps> = ({ results }) => {
  if (!results) {
    return null;
  }

  return (
    <GlassyCard title="Compliance Check Results">
      <pre><code>{JSON.stringify(results, null, 2)}</code></pre>
    </GlassyCard>
  );
};

export default ComplianceResultsDisplay;

