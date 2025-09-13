'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Product, AnalysisResult } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Download, AlertTriangle } from "lucide-react";
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
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = "text-red-500";
  if (score === 100) colorClass = "text-green-500";
  else if (score > 0) colorClass = "text-red-400"; // now red for partial too
  
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
      <DialogContent className="sm:max-w-5xl glass-card text-white border-blue-500/30 shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-300 drop-shadow-md">
            Compliance Audit: {product.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-8 py-4 max-h-[70vh] overflow-y-auto">
          {/* Left panel */}
          <div className="flex flex-col items-center justify-center p-6 bg-gray-900/40 rounded-2xl shadow-md space-y-6">
            <div className="relative w-full h-64">
                <Image 
                    src={product.images[0].url} 
                    alt={product.name} 
                    layout="fill"
                    objectFit="contain"
                    className="rounded-xl"
                />
            </div>
            {analysisResult && (
              <div className="flex flex-col items-center space-y-2">
                <h3 className="text-lg font-semibold text-slate-200">Compliance Score</h3>
                <ScoreCircle score={analysisResult["Compliance Score"]} />
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="flex flex-col space-y-6">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
                <p className="font-semibold text-slate-300 text-lg">Calculating Compliance Score...</p>
              </div>
            )}

            {analysisResult && (
              <>
                {/* Missing fields */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center text-red-400">
                    <AlertTriangle className="mr-2 h-5 w-5 text-red-500"/> Missing Mandatory Fields
                  </h3>
                  <div className="p-4 bg-red-900/10 rounded-xl border border-red-500/30 shadow-inner space-y-2 text-sm">
                    {analysisResult["Missing Fields"].length > 0 ? (
                      analysisResult["Missing Fields"].map(field => (
                        <p key={field} className="text-red-300 font-medium">- {field}</p>
                      ))
                    ) : (
                      <p className="text-green-400 flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-2"/> None. All mandatory fields were located.
                      </p>
                    )}
                  </div>
                </div>

                {/* Extracted values */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-slate-200">Extracted Values</h3>
                  <div className="p-5 bg-slate-900/30 rounded-xl border border-slate-700/40 shadow-md space-y-3 text-sm">
                    {Object.entries(analysisResult["Extracted Values"]).map(([key, value]) => (
                      <div key={key} className="pb-2 border-b border-slate-700/40 last:border-none">
                        <p className="font-semibold text-slate-300">{key}</p>
                        <p className="text-slate-100 pl-2 border-l-2 border-blue-500/50">{String(value) || 'Not Found'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {analysisResult && (
          <DialogFooter className="!justify-between mt-4">
            <Badge className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-md ${
              analysisResult["Compliance Status"] === "Fully Compliant" ? "bg-green-600/80 text-white" :
              analysisResult["Compliance Status"] === "Partially Compliant" ? "bg-red-600/80 text-white" :
              "bg-red-700/80 text-white"
            }`}>
              Status: {analysisResult["Compliance Status"]}
            </Badge>
            <Button 
              onClick={handleDownload} 
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg transition"
            >
              <Download className="mr-2 h-4 w-4"/> Download Report
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
