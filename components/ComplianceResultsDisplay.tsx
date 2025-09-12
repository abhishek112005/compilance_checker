import React from 'react';
import GlassyCard from './GlassyCard';
// FIXED: Import the correct type for your compliance data
import { AnalysisResult } from '@/lib/types';

interface ComplianceResultsDisplayProps {
  // FIXED: Replaced 'any' with the specific 'AnalysisResult' type
  results: AnalysisResult | null; 
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
