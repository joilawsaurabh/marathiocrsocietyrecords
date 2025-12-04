
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { OCRRecord, UploadedFile } from "../types";
import { quotaLogger } from "./quotaLogger";

// Gemini Pro Pricing (Approximate/Standard Tier)
const PRICE_PER_1M_INPUT_TOKENS = 3.50;
const PRICE_PER_1M_OUTPUT_TOKENS = 10.50;

const fileToGenerativePart = async (file: File) => {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const performOCR = async (files: UploadedFile[]): Promise<OCRRecord[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Construct the parts.
  const parts = [];
  
  parts.push({
    text: `Input Data: Below are ${files.length} images of handwritten Marathi property records.`
  });

  for (const uploadedFile of files) {
    const imagePart = await fileToGenerativePart(uploadedFile.file);
    parts.push({
      text: `File Name: "${uploadedFile.file.name}"`
    });
    parts.push(imagePart);
  }

  parts.push({
    text: `Task:
Perform "Slow-Thinking" Forensic OCR on these handwritten Marathi records.
IMPORTANT: You are analyzing the RAW ORIGINAL IMAGE FILES. Use the full resolution to detect micro-strokes.

**CORE DIRECTIVE: BOTTOM-UP RECONSTRUCTION (Strokes -> Alphabets -> Words)**
Do not look at a word and guess the name. You must identify each alphabet (Akshar) individually first.

**LANGUAGE CONSTRAINT**: All output text and alternatives MUST be in Marathi Devanagari script. Do not output English or transliterated text.

CRITICAL EXECUTION PROTOCOL:

STEP 1: ALPHABET-LEVEL (AKSHAR) DECOMPOSITION
- **Isolate**: Mentally draw a box around each individual character in the line.
- **Analyze**: For each box, identify the base consonant and any attached vowels (Matras).
- **Verify**: 
    - Is the vertical bar (Danda) complete? If no, it might be a half-consonant.
    - Is the Shiroresha (headline) broken?
    - Does the character have a loop (like 'ल' or 'म्ह') or an open curve (like 'त' or 'ग')?
    - Distinguish 'Pa' (प) vs 'Ya' (य) vs 'Sha' (ष) based on the inner diagonal stroke or stomach curve.
    - Distinguish 'Ma' (म) vs 'Bha' (भ) based on the loop connectivity to the headline.
    - **CRITICAL DISTINCTION**: 'Na' (न) vs 'La' (ल).
        - 'Na' (न) typically has a loop on the left and a straight connector.
        - 'La' (ल) has a "3" shape or a double curve starting from the vertical bar.
        - **Rule**: If the middle character has a double curve, it is 'La' (ल), not 'Na' (न) or 'Ta' (त).
        - **Example**: If visual looks like 'पुनेलु', CHECK if it is actually 'पुलेलु'.

STEP 2: SPATIAL MERGING (Superscript Handling)
- **Correction Logic**: If a word appears visually "rubbed out" or "scratched" and another word is written strictly ABOVE it -> **REPLACE** the rubbed word with the top word.
- **Insertion Logic**: If the bottom word is CLEAR and a word is squeezed in ABOVE it -> **CONCATENATE** the top word into the current line.
- **Constraint**: Do NOT create new lines for these floating words.

STEP 3: STROKE-BASED ALTERNATIVES (First 5 Options)
Generate these based on visual morphology and ambiguity found in Step 1.
**All options must be in Marathi Devanagari.**
1. **Visual Certainty**: The strict pixel-perfect transcription.
2. **Rubbed/Layered**: Interpret hidden strokes under a scratch.
3. **Morphological (Curve Focus)**: 
    - **MANDATORY**: Always provide the 'La' (ल) alternative if 'Na' (न) is detected, and vice-versa.
    - Swap 'ले' (Le) <-> 'ने' (Ne).
    - Swap 'ल' (La) <-> 'त' (Ta).
    - Swap 'प' (Pa) <-> 'ष' (Sha).
4. **Morphological (Geometry Focus)**: Swap 'ग' vs 'म', 'भ' vs 'म', 'र' vs 'स', 'ख' vs 'रव'.
5. **Matra/Vowel Check**: Add/Remove faint vowels (Velanti/Kana) e.g. 'पाटील' vs 'पाटिल'.

STEP 4: PHONETIC & CONTEXTUAL EXPANSION (Next 6 Options)
Generate 6 MORE options based purely on sound and common Marathi naming conventions.
**All options must be in Marathi Devanagari.**

6. **Phonetic Correction 1**: If the visual text is 'पुनेलु' (Punelu), suggest 'पुलेलु' (Pulelu).
7. **Phonetic Correction 2**: If 'पाटल' (Patl), suggest 'पाटील' (Patil).
8. **Sound-Alike 1**: Names that sound similar but have different spellings (e.g., 'शिंदे' vs 'शिन्दे').
9. **Sound-Alike 2**: 'चव्हाण' vs 'चौहान'.
10. **Contextual Guess 1**: Most common surname fitting the stroke pattern.
11. **Contextual Guess 2**: Alternative common spelling of the name.

OUTPUT REQUIREMENTS:
- **text**: Option 1 (Visual Certainty) in Marathi.
- **alternatives**: A flat list containing ALL options from Step 3 (2-5) and Step 4 (6-11). Total ~10-11 items. ALL in Marathi.
- **box_2d**: Precise bounding box [ymin, xmin, ymax, xmax] (0-1000 scale).

LAYOUT EXTRACTION:
1. **Flat Number (Sr. No)**: The number in the left margin.
2. **Original Owner**: The very first line of the main content.
3. **Transfers**: All lines following the original owner.

Return a strict JSON array.`
  });

  const lineSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        text: { type: Type.STRING, description: "Option 1: The most visually accurate transcription based on pixel evidence. Marathi Only." },
        alternatives: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of 10-12 alternative readings including Stroke Variations (Step 3) and Phonetic Predictions (Step 4). Marathi Only."
        },
        box_2d: {
            type: Type.ARRAY,
            items: { type: Type.INTEGER },
            description: "Bounding box coordinates [ymin, xmin, ymax, xmax] on a 0-1000 scale."
        }
    },
    required: ["text", "alternatives"]
  };

  const responseSchema: Schema = {
    type: Type.ARRAY,
    description: "List of OCR records for each file",
    items: {
      type: Type.OBJECT,
      properties: {
        file_name: { type: Type.STRING, description: "The name of the file" },
        document_type: { type: Type.STRING, description: "Type of document (e.g. 'नोंद', 'पत्र')" },
        flat_number: { 
            ...lineSchema,
            description: "The Sr. No or Flat Number from the first column."
        },
        original_owner: { 
            ...lineSchema, 
            description: "The text from the first line (Original Owner)." 
        },
        transfers: {
            type: Type.ARRAY,
            description: "List of subsequent transfer names.",
            items: lineSchema
        }
      },
      required: ["file_name", "document_type", "flat_number", "original_owner", "transfers"],
    },
  };

  const startTime = Date.now();
  const modelName = 'gemini-3-pro-preview';

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        role: 'user',
        parts: parts,
      },
      config: {
        systemInstruction: `Role: You are a Forensic Document Examiner specializing in Marathi Devanagari script.
Objective: Extract handwritten text with 100% stroke fidelity.

Verification Protocol (The "Slow Thinking" Method):
1.  **Trace**: Mentally trace the ink path of every character.
2.  **Verify**: Does the pixel data support the character? e.g., distinguishing 'Pa' (प) vs 'Ya' (य) based on the stomach curve. 'La' (ल) vs 'Ta' (त) based on the loop.
3.  **Reject**: Do not hallucinate standard names if the ink does not match. If it looks like 'Lodkar' but could be 'Todkar', list both.

Strict Constraints:
- **MARATHI SCRIPT ONLY**: Never output English, Roman, or Transliteration.
- **Stroke Priority**: Visual strokes > Semantic context. Even if a word makes no sense, if the strokes are there, transcribe them.
- **Format**: Return strictly valid JSON.`,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // Low temperature for strict adherence to visual data
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
        throw new Error("No response text received from model.");
    }

    const records = JSON.parse(jsonText) as OCRRecord[];

    // Calculate Cost
    let costPerRecord = 0;
    if (response.usageMetadata) {
        const promptTokens = response.usageMetadata.promptTokenCount || 0;
        const outputTokens = response.usageMetadata.candidatesTokenCount || 0;
        
        const inputCost = (promptTokens / 1000000) * PRICE_PER_1M_INPUT_TOKENS;
        const outputCost = (outputTokens / 1000000) * PRICE_PER_1M_OUTPUT_TOKENS;
        const totalCost = inputCost + outputCost;

        // Distribute cost evenly among records (files)
        if (records.length > 0) {
            costPerRecord = totalCost / records.length;
        }
    }

    // Attach cost to each record
    const recordsWithCost = records.map(r => ({
        ...r,
        estimated_cost: costPerRecord
    }));

    // Log successful API call
    const processingTime = Date.now() - startTime;
    const promptTokens = response.usageMetadata?.promptTokenCount || 0;
    const outputTokens = response.usageMetadata?.candidatesTokenCount || 0;
    const totalCost = recordsWithCost.reduce((sum, r) => sum + (r.estimated_cost || 0), 0);

    quotaLogger.logSuccess({
      model: modelName,
      filesProcessed: files.length,
      promptTokens,
      outputTokens,
      estimatedCost: totalCost,
      processingTimeMs: processingTime,
    });

    return recordsWithCost;

  } catch (error: any) {
    // Log failed API call
    const processingTime = Date.now() - startTime;
    quotaLogger.logError({
      model: modelName,
      filesProcessed: files.length,
      errorMessage: error.message || String(error),
      processingTimeMs: processingTime,
    });

    console.error("Gemini OCR Error:", error);
    throw error;
  }
};
