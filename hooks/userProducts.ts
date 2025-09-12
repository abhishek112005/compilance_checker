// app/hooks/useProducts.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { Product } from '../lib/types';

const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch('https://flipkart-backend-8z7t.onrender.com/api/v1/product/all-products');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data.products || []; 
};

export const useProducts = () => {
  return useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
};