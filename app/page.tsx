'use client';

import { useState, useEffect } from 'react';
// Corrected the import path for useProducts
import { useProducts } from "@/hooks/userProducts"; 
import { Product, AnalysisResult } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster, toast } from 'sonner';
import { SideNav } from '@/components/dashboard/SideNav';
import { BatchReport } from '@/components/dashboard/BatchReport';
import { ProductCard } from '@/components/dashboard/ProductCard';
import { ProductDetailModal } from '@/components/dashboard/ProductDetailModal';
import { motion, AnimatePresence } from 'framer-motion';

type View = 'inspector' | 'batch_report';
type AnalyzedProduct = {
    product: Product;
    result: AnalysisResult;
}

export default function Home() {
  const { data: products, error, isLoading } = useProducts();
  
  const [view, setView] = useState<View>('inspector'); 
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  // --- LOCALSTORAGE INTEGRATION ---
  // This ensures your audited product data is saved and reloaded on refresh.
  const [analyzedProducts, setAnalyzedProducts] = useState<AnalyzedProduct[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      const item = window.localStorage.getItem('analyzedProducts');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('analyzedProducts', JSON.stringify(analyzedProducts));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  }, [analyzedProducts]);
  // --- END OF LOCALSTORAGE INTEGRATION ---


  const handleAnalyze = async (product: Product) => {
    setSelectedProduct(product);
    setAnalysisResult(null);
    setIsModalOpen(true);
    setAnalyzingId(product._id);
    toast.info(`Auditing ${product.name}...`);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageUrl: product.images[0].url,
          productData: product 
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.details || 'Analysis failed on the server.');
      }
      
      const result: AnalysisResult = await response.json();
      setAnalysisResult(result);

      setAnalyzedProducts(prev => {
        const existingIndex = prev.findIndex(p => p.product._id === product._id);
        const newEntry = { product, result };
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = newEntry;
          return updated;
        }
        return [...prev, newEntry];
      });

      // --- UPDATED TOAST NOTIFICATIONS TO USE THE NEW SCORING LOGIC ---
      const score = result["Compliance Score"];
      const status = result["Compliance Status"];
      
      if (status === "Fully Compliant") {
        toast.success(`Audit Complete: ${status} (Score: ${score}%)`);
      } else if (status === "Partially Compliant") {
        toast.warning(`Audit Complete: ${status} (Score: ${score}%)`);
      } else {
        toast.error(`Audit Complete: ${status} (Score: ${score}%)`);
      }

    } catch (err: any) {
      toast.error(err.message || 'An error occurred during analysis.');
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] text-white">
      <Toaster richColors position="top-right" theme="dark" />
      <SideNav currentView={view} setView={setView} />
      
      <main className="flex-1 relative p-4 sm:p-8 overflow-y-auto flex flex-col">
        {/* Background subtle grid / pattern */}
        <div className="absolute inset-0 -z-10 opacity-30 bg-[radial-gradient(circle_at_1px_1px,#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
        >
          {/* Header with glass effect */}
          <div className="rounded-2xl border border-blue-400/20 bg-white/5 backdrop-blur-md shadow-lg p-6 mb-8">
            <h1 className="text-3xl font-extrabold text-slate-100 drop-shadow-lg">
              {view === 'inspector' ? 'Product Inspector' : 'Batch Compliance Report'}
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              {view === 'inspector' 
                ? 'Select a product to begin an AI-powered compliance audit.' 
                : 'Review the compliance status of all audited products.'}
            </p>
          </div>
        </motion.div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            {view === 'inspector' && (
              <div>
                {isLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="h-96 w-full rounded-2xl bg-gray-800/40" />
                    ))}
                  </div>
                )}
                {error && <p className="text-red-400">Error loading products: {error.message}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products?.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onAnalyze={handleAnalyze}
                      isAnalyzing={analyzingId === product._id}
                    />
                  ))}
                </div>
              </div>
            )}

            {view === 'batch_report' && (
              <div>
                <BatchReport analyzedProducts={analyzedProducts} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <ProductDetailModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        product={selectedProduct}
        analysisResult={analysisResult}
        isLoading={!!analyzingId}
      />
    </div>
  );
}

