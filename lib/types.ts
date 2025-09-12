// app/lib/types.ts

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  seller: string;
  stock: number;
  createdAt?: string; 
  images: {
    public_id: string;
    url: string;
  }[];
  // FIXED: Replaced 'any' with 'unknown' for better type safety
  [key: string]: unknown;
}

export interface ExtractedValues {
  "Manufacturer/Importer": string | null;
  "Net Quantity": string | null;
  "Manufacturing Date": string | null;
  "Expiry Date": string | null;
  "MRP": string | null;
  "Seller Details": string | null;
  "Customer Care": string | null;
  "API Title": string | null;
  "API Description": string | null;
  "API Created_At": string | null;
}

// This is the correct, up-to-date version of the AnalysisResult type.
// It matches the data structure used in your page.tsx and other components.
export interface AnalysisResult {
  "Compliance Status": "Fully Compliant" | "Partially Compliant" | "Non-Compliant";
  "Compliance Score": number;
  "Missing Fields": string[];
  "Extracted Values": ExtractedValues;
}

