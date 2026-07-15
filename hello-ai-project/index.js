// ============================================================================
// 🤖 Project 1: Hello AI Project
// ============================================================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

// ==========================================
// ⚙️ Configuration Settings
// ==========================================
const CONFIG = {
  MODEL_NAME: "gemini-3.1-flash-lite",
};

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function runHelloAI() {
  try {
    console.log("Sending request to Gemini model...");

    const model = genAI.getGenerativeModel({ model: CONFIG.MODEL_NAME });
    const prompt = "Write a 1-sentence welcome message for a new AI Engineer.";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("\nAI Response:");
    console.log(text);

  } catch (error) {
    console.error("Critical Error during API execution:", error.message);
  }
}

runHelloAI();