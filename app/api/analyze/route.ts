// app/api/analyze/route.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import { Product } from "@/lib/types";

async function urlToGoogleGenerativeAIPart(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
  const buffer = await response.arrayBuffer();
  return {
    inlineData: {
      data: Buffer.from(buffer).toString("base64"),
      mimeType: "image/jpeg",
    },
  };
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Server configuration error: Missing API Key.' }, { status: 500 });
  }

  try {
    const { imageUrl, productData }: { imageUrl: string; productData: Product } = await req.json();
    if (!imageUrl || !productData) {
      return NextResponse.json({ error: 'Missing imageUrl or productData' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });


    // --- STEP 1: Perform a raw, high-fidelity OCR scan ---
    const ocrPrompt = "Perform a detailed Optical Character Recognition (OCR) scan on this image. Extract all visible text as accurately as possible. Output the raw text only.";
    const imagePart = await urlToGoogleGenerativeAIPart(imageUrl);
    const ocrResult = await visionModel.generateContent([ocrPrompt, imagePart]);
    const ocrText = ocrResult.response.text();


    // --- STEP 2: Use the extracted text and API data for the final compliance analysis ---
    const synthesisPrompt = `
      You are an AI compliance checker for e-commerce product listings under the Legal Metrology (Packaged Commodities) Rules, 2011 (India).
      Synthesize information from the OCR text and API JSON to generate a compliance report.

      Mandatory fields to find: "Manufacturer/Importer", "Net Quantity", "Manufacturing Date", "Expiry Date", "MRP", "Seller Details", "Customer Care".

      Instructions:
      - Use BOTH the OCR text and API JSON data.
      - If a field is missing, its value must be null.
      - Output strictly in the specified JSON format.

      --- START OF DATA ---
      OCR Extracted Text: """${ocrText}"""
      API JSON Data: """${JSON.stringify(productData, null, 2)}"""
      --- END OF DATA ---

      Generate the report in this exact JSON structure:
      {
        "Extracted Values": {
          "Manufacturer/Importer": "...",
          "Net Quantity": "...",
          "Manufacturing Date": "...",
          "Expiry Date": "...",
          "MRP": "...",
          "Seller Details": "...",
          "Customer Care": "...",
          "API Title": "${productData.name || null}",
          "API Description": "${productData.description || null}",
          "API Created_At": "${productData.createdAt || null}"
        }
      }
    `;
    
    const synthesisResult = await textModel.generateContent(synthesisPrompt);
    const synthesisText = synthesisResult.response.text();
    
    const jsonMatch = synthesisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("AI did not return a valid JSON object.");
    }
    const reportData = JSON.parse(jsonMatch[0]);
    const extractedValues = reportData["Extracted Values"];
    
    // --- SCORING AND STATUS LOGIC ---
    const MANDATORY_FIELDS = ["Manufacturer/Importer", "Net Quantity", "Manufacturing Date", "Expiry Date", "MRP", "Seller Details", "Customer Care"];
    let foundFieldsCount = 0;
    const missingFields: string[] = [];

    MANDATORY_FIELDS.forEach(field => {
        if (extractedValues[field] && String(extractedValues[field]).trim() !== "") {
            foundFieldsCount++;
        } else {
            missingFields.push(field);
        }
    });

    const complianceScore = Math.round((foundFieldsCount / MANDATORY_FIELDS.length) * 100);
    let complianceStatus: "Fully Compliant" | "Partially Compliant" | "Non-Compliant";

    if (complianceScore === 100) {
        complianceStatus = "Fully Compliant";
    } else if (complianceScore > 0) {
        complianceStatus = "Partially Compliant";
    } else {
        complianceStatus = "Non-Compliant";
    }

    const finalReport = {
        "Compliance Status": complianceStatus,
        "Compliance Score": complianceScore,
        "Missing Fields": missingFields,
        "Extracted Values": extractedValues,
    };

    return NextResponse.json(finalReport);

  } catch (error: unknown) { // FIXED: Replaced 'any' with 'unknown' for type safety
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: 'Failed to analyze product.', details: errorMessage }, { status: 500 });
  }
}

