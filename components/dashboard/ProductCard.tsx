// app/components/dashboard/ProductCard.tsx
'use client';

import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ScanEye, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  onAnalyze: (product: Product) => void;
  isAnalyzing: boolean;
}

export const ProductCard = ({ product, onAnalyze, isAnalyzing }: ProductCardProps) => {
  return (
    <motion.div 
      className="
        relative rounded-2xl border border-blue-400/30 
        bg-white/10 backdrop-blur-md shadow-lg 
        hover:border-blue-400/70 hover:shadow-blue-400/40 
        transition-all duration-300 hover:-translate-y-2 
        flex flex-col
      "
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="overflow-hidden flex flex-col h-full">
        <div className="relative">
          <img
            src={product.images[0]?.url || 'https://via.placeholder.com/400'}
            alt={product.name}
            className="w-full h-48 object-cover rounded-t-2xl transform transition-transform duration-300 hover:scale-105"
          />
          {/* Removed red overlay → clean product image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-t-2xl"></div>
        </div>

        <div className="p-4 flex-grow flex flex-col">
          <h3 className="font-bold text-lg truncate text-white drop-shadow-md">{product.name}</h3>
          <p className="text-sm text-blue-300 font-medium">{product.category}</p>
          <p className="text-xl font-bold mt-2 text-slate-100">₹{product.price}</p>
        </div>

        <div className="p-4 mt-auto">
         <Button
  className="
    w-full rounded-xl bg-green-500 
    hover:bg-green-600 
    text-white font-semibold 
    shadow-md hover:shadow-green-400/40 
    transition-all duration-300
    flex items-center justify-center gap-2
  "
  onClick={() => onAnalyze(product)}
  disabled={isAnalyzing}
>
  {isAnalyzing ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <ScanEye className="h-4 w-4" />
  )}
  {isAnalyzing ? "Auditing..." : "Audit Compliance"}
</Button>

        </div>
      </div>
    </motion.div>
  );
};
