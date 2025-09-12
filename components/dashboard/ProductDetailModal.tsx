'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Product, AnalysisResult } from "@/lib/types";
// FIXED: Added the missing import for the Badge component
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Download, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

const generateReportText = (product: Product, result: AnalysisResult) => {
    let report = `Compliance Audit Report for: ${product.name}\n`;
    report += `---------------------------------------\n\n`;
    report += `Compliance Score: ${result["Compliance Score"]}%\n`;
    report += `Compliance Status: ${result["Compliance Status"]}\n\n`;
    
    report += `--- MISSING MANDATORY FIELDS (${result["Missing Fields"].length}) ---\n`;
    if (result["Missing Fields"].length === 0) {
        report += "None. All mandatory fields were found.\n";
    } else {
        result["Missing Fields"].forEach(field => {
            report += `- ${field}\n`;
        });
    }

    report += `\n--- EXTRACTED VALUES ---\n`;
    for (const [key, value] of Object.entries(result["Extracted Values"])) {
        report += `${key}: ${value || 'N/A'}\n`;
    }
    return report;
};

const ScoreCircle = ({ score }: { score: number }) => {
  const circumference = 2 * Math.PI * 45; // 2 * pi * radius
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = "text-red-500";
  if (score === 100) colorClass = "text-green-500";
  else if (score > 0) colorClass = "text-yellow-500";
  
  return (
    <div className="relative h-32 w-32">
      <svg className="absolute inset-0" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" stroke="#334155" strokeWidth="10" fill="transparent" />
        <motion.circle
          cx="50" cy="50" r="45"
          className={`stroke-current ${colorClass}`}
          strokeWidth="10"
          fill="transparent"
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-3xl font-bold ${colorClass}`}>{score}%</span>
      </div>
    </div>
  );
};

// Defined a proper interface for the component's props to fix 'any' type errors
interface ProductDetailModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  product: Product | null;
  analysisResult: AnalysisResult | null;
  isLoading: boolean;
}

export function ProductDetailModal({ isOpen, onOpenChange, product, analysisResult, isLoading }: ProductDetailModalProps) {
  if (!product) return null;

  const handleDownload = () => {
    if (!analysisResult) return;
    const text = generateReportText(product, analysisResult);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${product.name.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
   };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl glass-card text-white border-red-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl">Compliance Audit: {product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-6 py-4 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col items-center justify-center p-4 bg-gray-900/30 rounded-lg space-y-4">
            <Image 
                src={product.images[0].url} 
                alt={product.name} 
                width={400} 
                height={400} 
                className="rounded-lg object-contain max-h-64 w-auto" 
            />
            {analysisResult && (
              <>
                <h3 className="text-xl font-semibold">Compliance Score</h3>
                <ScoreCircle score={analysisResult["Compliance Score"]} />
              </>
            )}
          </div>

          <div className="flex flex-col space-y-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-red-400 mb-4" />
                <p className="font-semibold text-slate-300">Calculating Compliance Score...</p>
              </div>
            )}

            {analysisResult && (
              <>
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center text-red-400">
                    <AlertTriangle className="mr-2 h-5 w-5"/> Missing Mandatory Fields
                  </h3>
                  <div className="p-4 bg-red-950/20 rounded-lg space-y-2 text-sm border border-red-500/20">
                    {analysisResult["Missing Fields"].length > 0 ? (
                      analysisResult["Missing Fields"].map(field => <p key={field} className="text-red-300 font-medium">- {field}</p>)
                    ) : (
                      <p className="text-slate-400 flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500"/>None. All mandatory fields were located.</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-slate-200">Extracted Values</h3>
                   <div className="p-4 bg-slate-900/20 rounded-lg space-y-3 text-sm border border-slate-700/50">
                    {Object.entries(analysisResult["Extracted Values"]).map(([key, value]) => (
                        <div key={key}>
                            <p className="font-semibold text-slate-200">{key}</p>
                            <p className="text-slate-100 pl-2 border-l-2 border-red-500/50">{String(value) || 'Not Found'}</p>
                        </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        {analysisResult && (
            <DialogFooter className="!justify-between">
                {/* Badge now uses the new three-tier status */}
                <Badge className={`font-semibold ${
                    analysisResult["Compliance Status"] === "Fully Compliant" ? "bg-green-600/80 text-white" :
                    analysisResult["Compliance Status"] === "Partially Compliant" ? "bg-yellow-600/80 text-white" : ""
                }`}>
                    Status: {analysisResult["Compliance Status"]}
                </Badge>
                <Button onClick={handleDownload} className="accent-glow-button">
                    <Download className="mr-2 h-4 w-4"/>Download Report
                </Button>
            </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

