import React, { useState } from 'react';
import ComplianceInputForm from './ComplianceInputForm';
import ComplianceResultsDisplay from './ComplianceResultsDisplay';
// Assuming your App.css is in the parent directory or configured in your bundler
import '../App.css'; 
// FIXED: Import the correct type for your compliance data
import { AnalysisResult } from '@/lib/types';

const ComplianceCheckerApp: React.FC = () => {
  // FIXED: Replaced 'any' with the specific 'AnalysisResult' type
  const [complianceResults, setComplianceResults] = useState<AnalysisResult | null>(null);

  const handleComplianceCheck = (apiJson: string, ocrText: string) => {
    console.log("API JSON Data:", apiJson);
    console.log("OCR Extracted Text:", ocrText);

    // This is where your real API call would go.
    // For now, we'll use a dummy result that matches the AnalysisResult type.
    const dummyResults: AnalysisResult = {
      "Compliance Status": "Partially Compliant",
      "Compliance Score": 71,
      "Missing Fields": ["Expiry Date", "Seller Details"],
      "Extracted Values": {
        "Manufacturer/Importer": "Das Superfoods Pvt. Ltd.",
        "Net Quantity": "500 g",
        "Manufacturing Date": "01/2024",
        "Expiry Date": null,
        "MRP": "₹275.00",
        "Seller Details": null,
        "Customer Care": "support@pintola.in",
        "API Title": "Pintola All Natural Peanut Butter",
        "API Description": "A jar of peanut butter.",
        "API Created_At": "2024-01-01T12:00:00.000Z"
      }
    };
    setComplianceResults(dummyResults);
  };

  return (
    <div className="glassy-container">
      <h1>E-commerce Product Compliance Checker</h1>
      <ComplianceInputForm onSubmit={handleComplianceCheck} />
      <ComplianceResultsDisplay results={complianceResults} />
    </div>
  );
};

export default ComplianceCheckerApp;
