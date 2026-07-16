// ============================================================================
// Project 5: Vision Applications
// ============================================================================

import "dotenv/config";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ==========================================
// ⚙️ Configuration Settings
// ==========================================
const CONFIG = {
  MODEL_NAME: "gemini-3.1-flash-lite",
};

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Convert image to Gemini format
function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: fs.readFileSync(filePath).toString("base64"),
      mimeType,
    },
  };
}

// Analyze image
async function analyzeImage(imagePath, mimeType) {
  try {
    const model = genAI.getGenerativeModel({
      model: CONFIG.MODEL_NAME,
    });

    const imagePart = fileToGenerativePart(imagePath, mimeType);

    const result = await model.generateContent([
      "Analyze this image in detail.",
      imagePart,
    ]);

    console.log(result.response.text());
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example
analyzeImage("./test-img.png", "image/png");
