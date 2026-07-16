// ============================================================================
// Project 4: Stream AI Response
// ============================================================================

import express from 'express';
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
  MODEL_NAME: "gemini-3.1-flash-lite",
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/stream', async (req, res) => {
  const { prompt } = req.body;
  const model = genAI.getGenerativeModel({ model: CONFIG.MODEL_NAME });

  // 1. Set streaming headers
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");

  try {
    // 2. Start streaming request
    const result = await model.generateContentStream(prompt);
    // 3. Pipe chunks to the client
    for await (const chunk of result.stream) {
      res.write(chunk.text());
    }
    res.end();
  } catch (error) {
    console.error("Stream Error:", error);
    res.status(500).write("Error generating content");
    res.end();
  }
});

app.listen(CONFIG.PORT, () => console.log(`Server running on http://localhost:${CONFIG.PORT}`));