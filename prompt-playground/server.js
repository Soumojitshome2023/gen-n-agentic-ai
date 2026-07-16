// ============================================================================
// Project 2: Prompt Playground
// ============================================================================

import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const app = express();
app.use(express.json());
app.use(express.static("public"));

// ==========================================
// ⚙️ Configuration Settings
// ==========================================
const CONFIG = {
  PORT: 3000,
  DEFAULT_MODEL: "gemini-3.1-flash-lite",
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 1000,
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, temperature, maxTokens } = req.body;
    const model = genAI.getGenerativeModel({ model: CONFIG.DEFAULT_MODEL });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { 
        temperature: temperature !== undefined ? temperature : CONFIG.DEFAULT_TEMPERATURE, 
        maxOutputTokens: maxTokens !== undefined ? maxTokens : CONFIG.DEFAULT_MAX_TOKENS 
      },
    });

    res.json({ response: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(CONFIG.PORT, () => console.log(`Server running at http://localhost:${CONFIG.PORT}`));