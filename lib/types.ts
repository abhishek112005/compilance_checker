// app/lib/types.ts

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  seller: string;
  stock: number;
  images: {
    public_id: string;
    url: string;
  }[];
}

export interface AnalysisResult {
  isCompliant: boolean;
  issues: string[];
  comparisonResults: Record<string, {
    status: 'pass' | 'fail';
    expected: string;
    actual: string;
  }>;
}