'use client';

import { AnalysisResult, Product } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle, LayoutGrid, ShieldCheck, BarChart2, Download, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CountUp from "react-countup";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useMemo } from "react";

// --- HELPER FUNCTIONS ---
const getCategoryTrends = (analyzedProducts: { product: Product; result: AnalysisResult }[]) => {
    const categoryViolations: { [key: string]: number } = {};
    analyzedProducts.forEach(({ product, result }) => {
        if (result["Compliance Status"] !== "Fully Compliant") {
            const category = product.category || "Uncategorized";
            if (!categoryViolations[category]) {
                categoryViolations[category] = 0;
            }
            categoryViolations[category]++;
        }
    });
    return Object.entries(categoryViolations).map(([name, violations]) => ({ name, violations }));
};

const getSellerTrends = (analyzedProducts: { product: Product; result: AnalysisResult }[]) => {
    const sellerViolations: { [key: string]: number } = {};
    analyzedProducts.forEach(({ product, result }) => {
        if (result["Compliance Status"] !== "Fully Compliant") {
            const seller = product.seller || "Unknown Seller";
            if (!sellerViolations[seller]) {
                sellerViolations[seller] = 0;
            }
            sellerViolations[seller]++;
        }
    });
    return Object.entries(sellerViolations)
        .map(([name, violations]) => ({ name, violations }))
        .sort((a, b) => b.violations - a.violations)
        .slice(0, 5);
};

const exportViolationsToCSV = (analyzedProducts: { product: Product; result: AnalysisResult }[]) => {
    let csvContent = "data:text/csv;charset=utf-8,Product Name,Category,Seller,Compliance Score,Compliance Status,Missing Fields\n";
    
    analyzedProducts.forEach(({ product, result }) => {
        if (result["Compliance Status"] !== "Fully Compliant") {
            const row = [
                `"${product.name.replace(/"/g, '""')}"`,
                product.category,
                product.seller,
                `${result["Compliance Score"]}%`,
                result["Compliance Status"],
                `"${result["Missing Fields"].join(", ")}"`
            ].join(",");
            csvContent += row + "\n";
        }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "compliance_violations_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// --- MAIN COMPONENT ---
export function BatchReport({ analyzedProducts }: { analyzedProducts: { product: Product; result: AnalysisResult }[] }) {
    const fullyCompliantCount = useMemo(() => analyzedProducts.filter(p => p.result["Compliance Status"] === "Fully Compliant").length, [analyzedProducts]);
    
    const averageComplianceScore = useMemo(() => {
        if (analyzedProducts.length === 0) return 0;
        const totalScore = analyzedProducts.reduce((sum, p) => sum + p.result["Compliance Score"], 0);
        return totalScore / analyzedProducts.length;
    }, [analyzedProducts]);

    const categoryData = useMemo(() => getCategoryTrends(analyzedProducts), [analyzedProducts]);
    const sellerData = useMemo(() => getSellerTrends(analyzedProducts), [analyzedProducts]);

  if (analyzedProducts.length === 0) {
    return (
        <div className="text-center py-16 glass-card border-red-500/30">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-2 text-sm font-semibold text-white">No products audited yet</h3>
            <p className="mt-1 text-sm text-slate-400">
                Go to the &apos;Product Inspector&apos; tab to start auditing products.
            </p>
        </div>
    )
  }

  return (
    <div className="space-y-6">
        {/* KPI Cards */}
       <div className="grid gap-4 md:grid-cols-3">
            {/* Total Audited */}
            <Card className="glass-card bg-blue-950/40 border border-blue-700/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-blue-400">Total Audited</CardTitle>
                    <LayoutGrid className="h-4 w-4 text-cyan-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-extrabold text-blue-300 drop-shadow-lg">
                        <CountUp end={analyzedProducts.length} duration={1.5} />
                    </div>
                </CardContent>
            </Card>

            {/* Fully Compliant */}
            <Card className="glass-card bg-green-950/40 border border-green-700/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-green-400">Fully Compliant</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-extrabold text-green-300 drop-shadow-md">
                        <CountUp end={fullyCompliantCount} duration={1.5} />
                    </div>
                </CardContent>
            </Card>

            {/* Average Compliance Score */}
            <Card className="glass-card bg-blue-950/40 border border-blue-700/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-blue-400">Average Compliance Score</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-extrabold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent drop-shadow-md">
                        <CountUp end={averageComplianceScore} duration={1.5} decimals={1} suffix="%" />
                    </div>
                </CardContent>
            </Card>
       </div>

       {/* Charts */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center text-white"><BarChart2 className="mr-2 h-5 w-5 text-red-400"/>Products with Violations by Category</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.1)' }} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: 'white', borderRadius: '0.75rem' }} />
                            <Bar dataKey="violations" fill="#f87171" name="Products with Violations" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center text-white"><Users className="mr-2 h-5 w-5 text-red-400"/>Top 5 Sellers by Violations</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sellerData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}/>
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}/>
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.1)' }} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: 'white', borderRadius: '0.75rem' }} />
                            <Bar dataKey="violations" fill="#fb923c" name="Products with Violations" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
       </div>

      {/* Audit Summary Table */}
      <div className="glass-card">
        <div className="p-6 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Audit Summary & Violation Reports</h3>
            <Button className="accent-glow-button" onClick={() => exportViolationsToCSV(analyzedProducts)}>
                <Download className="mr-2 h-4 w-4" /> Export Violation Reports (CSV)
            </Button>
        </div>
        <div className="border-t border-red-500/20">
            <Table>
                <TableHeader>
                <TableRow className="border-b-red-500/20 hover:bg-transparent">
                    <TableHead className="text-slate-300">Product</TableHead>
                    <TableHead className="text-slate-300">Score</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Missing Fields</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {analyzedProducts.map(({ product, result }) => (
                    <TableRow key={product._id} className="border-b-red-500/20 last:border-b-0 hover:bg-red-950/20">
                    <TableCell className="font-medium text-slate-100">{product.name}</TableCell>
                    <TableCell className={`font-semibold ${
                        result["Compliance Score"] === 100 ? 'text-green-400' :
                        result["Compliance Score"] > 0 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                        {result["Compliance Score"]}%
                    </TableCell>
                    <TableCell>
                        {result["Compliance Status"] === "Fully Compliant" ? (
                            <Badge className="bg-green-900/50 text-green-300 border border-green-500/30">
                                <CheckCircle2 className="mr-1 h-3 w-3" /> Fully Compliant
                            </Badge>
                        ) : result["Compliance Status"] === "Partially Compliant" ? (
                            <Badge className="bg-yellow-900/50 text-yellow-300 border border-yellow-500/30">
                                <AlertTriangle className="mr-1 h-3 w-3" /> Partially Compliant
                            </Badge>
                        ) : (
                            <Badge className="bg-red-900/50 text-red-300 border border-red-500/30">
                                <XCircle className="mr-1 h-3 w-3" /> Non-Compliant
                            </Badge>
                        )}
                    </TableCell>
                    <TableCell className="font-semibold text-red-400">{result["Missing Fields"].length}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
      </div>
    </div>
  );
}
