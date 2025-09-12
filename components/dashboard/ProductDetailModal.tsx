'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Product, AnalysisResult } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Download, AlertTriangle } from "lucide-react";

const generateReportText = (product: Product, result: AnalysisResult) => {
  let report = `Compliance Audit Report for: ${product.name}\n`;
  report += `---------------------------------------\n\n`;

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

export function ProductDetailModal({ isOpen, onOpenChange, product, analysisResult, isLoading }: any) {
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
      <DialogContent
        className="sm:max-w-5xl rounded-2xl border border-green-400/20 
                   bg-white/10 backdrop-blur-md shadow-xl text-white"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-100">
            Compliance Audit: <span className="text-green-300">{product.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh]">
          {/* Fixed Image Section */}
          <div className="flex items-center justify-center p-4 bg-slate-900/30 rounded-lg sticky top-0 h-full">
            <img
              src={product.images[0].url}
              alt={product.name}
              className="rounded-xl object-contain max-h-[65vh] w-full shadow-lg"
            />
          </div>

          {/* Scrollable Content */}
          <div className="flex flex-col space-y-4 overflow-y-auto pr-2 max-h-[65vh]">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-green-400 mb-4" />
                <p className="font-medium text-slate-300">Scanning product...</p>
              </div>
            )}

            {analysisResult && (
              <>
                {/* Missing Fields */}
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center text-yellow-400">
                    <AlertTriangle className="mr-2 h-5 w-5"/> Missing Mandatory Fields
                  </h3>
                  <div className="p-4 bg-yellow-400/10 rounded-xl border border-yellow-400/30 space-y-2">
                    {analysisResult["Missing Fields"].length > 0 ? (
                      analysisResult["Missing Fields"].map(field => (
                        <p key={field} className="text-yellow-200 font-medium flex items-center">
                          <XCircle className="h-4 w-4 mr-2 text-red-400"/> {field}
                        </p>
                      ))
                    ) : (
                      <p className="text-green-300 flex items-center font-medium">
                        <CheckCircle2 className="h-4 w-4 mr-2"/> All mandatory fields are present
                      </p>
                    )}
                  </div>
                </div>

                {/* Extracted Values */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-slate-200">Extracted Values</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(analysisResult["Extracted Values"]).map(([key, value]) => (
                      <div key={key} className="p-3 bg-white/5 rounded-lg border border-slate-700/50">
                        <p className="font-semibold text-slate-300 text-sm">{key}</p>
                        <p className={`mt-1 text-base font-medium ${
                          value ? "text-slate-100" : "text-red-400 italic"
                        }`}>
                          {String(value) || "Not Found"}
                        </p>
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
            <Badge
              className={`px-4 py-2 rounded-full text-sm font-semibold shadow-md ${
                analysisResult["Compliance Status"] === "Compliant"
                  ? "bg-green-500/20 text-green-300 border border-green-500/40"
                  : "bg-red-500/20 text-red-300 border border-red-500/40"
              }`}
            >
              Status: {analysisResult["Compliance Status"]}
            </Badge>
            <Button
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700 
                         text-white px-4 py-2 rounded-lg shadow-md 
                         transition-colors duration-200"
            >
              <Download className="mr-2 h-4 w-4"/> Download Report
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
