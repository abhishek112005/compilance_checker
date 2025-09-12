'use client';

import { AnalysisResult, Product } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle, LayoutGrid, ShieldCheck, BarChart2, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CountUp from "react-countup";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useMemo } from "react";

// --- HELPER FUNCTIONS ---
const getCategoryTrends = (analyzedProducts: { product: Product; result: AnalysisResult }[]) => {
    const categoryViolations: { [key: string]: number } = {};
    analyzedProducts.forEach(({ product, result }) => {
        if (result["Compliance Status"] === "Non-Compliant") {
            const category = product.category || "Uncategorized";
            if (!categoryViolations[category]) {
                categoryViolations[category] = 0;
            }
            categoryViolations[category]++;
        }
    });
    return Object.entries(categoryViolations).map(([name, violations]) => ({ name, violations }));
};

const exportViolationsToCSV = (analyzedProducts: { product: Product; result: AnalysisResult }[]) => {
    let csvContent = "data:text/csv;charset=utf-8,Product Name,Category,Seller,Missing Fields\n";
    
    analyzedProducts.forEach(({ product, result }) => {
        if (result["Compliance Status"] === "Non-Compliant") {
            const row = [
                `"${product.name.replace(/"/g, '""')}"`,
                product.category,
                product.seller,
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
    const compliantCount = useMemo(() => analyzedProducts.filter(p => p.result["Compliance Status"] === "Compliant").length, [analyzedProducts]);
    const complianceRate = useMemo(() => analyzedProducts.length > 0 ? (compliantCount / analyzedProducts.length) * 100 : 0, [analyzedProducts, compliantCount]);
    const categoryData = useMemo(() => getCategoryTrends(analyzedProducts), [analyzedProducts]);

  if (analyzedProducts.length === 0) {
    return (
        <div className="text-center py-16 border border-red-200 bg-red-50 rounded-lg">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-2 text-sm font-semibold text-gray-700">No products audited yet</h3>
            <p className="mt-1 text-sm text-gray-500">
                Go to the 'Product Inspector' tab to start auditing products.
            </p>
        </div>
    )
  }

  return (
    <div className="space-y-6 text-gray-900 bg-gray-50 min-h-screen p-6 rounded-lg">
        {/* KPI Cards */}
       <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-white shadow border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700">Total Audited</CardTitle>
                    <LayoutGrid className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-gray-900">
                        <CountUp end={analyzedProducts.length} duration={1.5} />
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-white shadow border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700">Compliant Products</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-gray-900">
                        <CountUp end={compliantCount} duration={1.5} />
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-white shadow border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700">Real-time Compliance Score</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-gray-900">
                        <CountUp end={complianceRate} duration={1.5} decimals={1} suffix="%" />
                    </div>
                </CardContent>
            </Card>
       </div>

       {/* Charts */}
       <div className="grid grid-cols-1 gap-6">
            <Card className="bg-white shadow border">
                <CardHeader>
                    <CardTitle className="flex items-center text-gray-800"><BarChart2 className="mr-2 h-5 w-5 text-red-500"/>Violations by Category</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#374151" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#374151" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }} />
                            <Bar dataKey="violations" fill="#ef4444" name="Non-Compliant Products" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
       </div>

      {/* Audit Summary Table */}
      <div className="bg-white shadow border rounded-lg">
        <div className="p-6 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Audit Summary & Violation Reports</h3>
            <Button variant="outline" onClick={() => exportViolationsToCSV(analyzedProducts)}>
                <Download className="mr-2 h-4 w-4" /> Export Violations (CSV)
            </Button>
        </div>
        <div className="border-t">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="text-gray-700">Product</TableHead>
                    <TableHead className="text-gray-700">Category</TableHead>
                    <TableHead className="text-gray-700">Status</TableHead>
                    <TableHead className="text-gray-700">Missing Fields</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {analyzedProducts.map(({ product, result }) => (
                    <TableRow key={product._id}>
                    <TableCell className="font-medium text-gray-900">{product.name}</TableCell>
                    <TableCell className="text-gray-700">{product.category}</TableCell>
                    <TableCell>
                        {result["Compliance Status"] === "Compliant" ? (
                            <Badge className="bg-green-100 text-green-700 border border-green-400">
                                <CheckCircle2 className="mr-1 h-3 w-3" /> Compliant
                            </Badge>
                        ) : (
                            <Badge className="bg-red-100 text-red-700 border border-red-400">
                                <XCircle className="mr-1 h-3 w-3" /> Non-Compliant
                            </Badge>
                        )}
                    </TableCell>
                    <TableCell className="font-semibold text-red-600">{result["Missing Fields"].length}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
      </div>
    </div>
  );
}
