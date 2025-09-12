import React, { useState } from 'react';
import ComplianceInputForm from './ComplianceInputForm';
import ComplianceResultsDisplay from './ComplianceResultsDisplay';
import '../App.css'; 

const ComplianceCheckerApp: React.FC = () => {
  const [complianceResults, setComplianceResults] = useState<any | null>(null);

  const handleComplianceCheck = (apiJson: string, ocrText: string) => {
    console.log("API JSON Data:", apiJson);
    console.log("OCR Extracted Text:", ocrText);

    // TODO: Implement the actual compliance checking logic here
    // This is where you would parse the API JSON and OCR text,
    // extract mandatory fields, compare, and determine compliance status.
    // For now, let's just set a dummy result.
    const dummyResults = {
      "Compliance_Status": "Non-Compliant",
      "Missing_Fields": ["Manufacturer_Importer", "Expiry_Date"],
      "Extracted_Values": {
        "Manufacturer_Importer": null,
        "Net_Quantity": "1000 ml",
        "Manufacturing_Date": "2025-09-11",
        "Expiry_Date": null,
        "MRP": "Rs. 296",
        "Seller_Details": "XYZ Retailers Pvt Ltd",
        "Customer_Care": "1800-123-4567",
        "API_Title": "FORTUNE SOYA BEAN OIL PACK OF 1 Soyabean Oil Pouch (1000 ml)",
        "API_Description": "Fortune soya bean oil",
        "API_Created_At": "2025-09-11T06:12:52.400Z"
      },
      "OCR_Extracted_Text": ocrText
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

