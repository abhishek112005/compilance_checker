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

// --- NEW HELPER FUNCTION FOR RETRY LOGIC ---
async function generateWithRetry(model: any, prompt: any, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            return result;
        } catch (error: any) {
            // Check if the error is a 503 Service Unavailable error
            if (error.toString().includes('503')) {
                console.log(`Attempt ${attempt} failed: Model is overloaded. Retrying in 2 seconds...`);
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds before retrying
                } else {
                    throw new Error("Model is overloaded. Please try again later after multiple retries.");
                }
            } else {
                // For any other error, throw it immediately
                throw error;
            }
        }
    }
    throw new Error("Failed to get a response from the model after multiple retries.");
}


export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new NextResponse(JSON.stringify({ error: 'Server configuration error: Missing API Key.' }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
    });
  }

  try {
    const { imageUrl, productData }: { imageUrl: string; productData: Product } = await req.json();
    if (!imageUrl || !productData) {
      return new NextResponse(JSON.stringify({ error: 'Missing imageUrl or productData' }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const ocrPrompt = "Perform a detailed Optical Character Recognition (OCR) scan on this image. Extract all visible text as accurately as possible. Output the raw text only.";
    const imagePart = await urlToGoogleGenerativeAIPart(imageUrl);
    
    // Using the retry helper for the vision model
    const ocrResult = await generateWithRetry(visionModel, [ocrPrompt, imagePart]);
    const ocrText = ocrResult.response.text();

    const synthesisPrompt = `
      You are an AI compliance checker for e-commerce product listings under the Legal Metrology (Packaged Commodities) Rules, 2011 (India).
      I will provide you with two inputs: OCR text from a product image and the product's API JSON data.
      Your job is to synthesize information from BOTH sources to generate a compliance report.

      Mandatory compliance fields:
      1. Name and address of the manufacturer/packer/importer
      2. Net quantity
      3. Manufacturing date and expiry/best before date
      4. Retail sale price (MRP)
      5. Seller details
      6. Customer care contact information

      Instructions:
      - Use BOTH the OCR text and API JSON data together to extract values.
      - If a field is missing in both, mark it as null.
      - If a field appears in one source but not the other, still capture it.
      - Mark product as "Compliant" only if ALL mandatory fields are present.
      - Output strictly in the specified JSON format and nothing else.

      --- START OF DATA ---
      
      OCR Extracted Text:
      """
      ${ocrText}
      """

      API JSON Data:
      """
      ${JSON.stringify(productData, null, 2)}
      """

      --- END OF DATA ---

      Now, generate the compliance report based on the data provided above.
      The output format MUST be this exact JSON structure:
      {
        "Compliance Status": "Compliant" | "Non-Compliant",
        "Missing Fields": [ "list of missing mandatory fields" ],
        "Extracted Values": {
          "Manufacturer/Importer": "...",
          "Net Quantity": "...",
          "Manufacturing Date": "...",
          "Expiry Date": "...",
          "MRP": "...",
          "Seller Details": "...",
          "Customer Care": "...",
          "API Title": "${productData.name || null}",
          "API Description": "${productData.description || null}"
         
        }
      }
    `;
    
    // Using the retry helper for the text model
    const synthesisResult = await generateWithRetry(textModel, synthesisPrompt);
    const synthesisText = synthesisResult.response.text();
    
    const jsonMatch = synthesisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("AI did not return a valid JSON object.");
    }
    const finalReport = JSON.parse(jsonMatch[0]);

    return new NextResponse(JSON.stringify(finalReport), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return new NextResponse(JSON.stringify({ error: 'Failed to analyze product.', details: errorMessage }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
    });
  }
}

