import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HfInference } from "@huggingface/inference";
import "dotenv/config";

const app = express();
app.use(express.json());
app.use(express.static("public"));

// ==========================================
// ⚙️ Configuration Settings
// ==========================================
const CONFIG = {
  PORT: 3000,
  GEMINI_MODEL: "gemini-3.1-flash-lite",
  HF_MODEL: "black-forest-labs/FLUX.1-schnell",
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const hf = new HfInference(process.env.HF_TOKEN);

app.post("/api/generate", async (req, res) => {
  try {
    const { topic } = req.body;
    const model = genAI.getGenerativeModel({
      model: CONFIG.GEMINI_MODEL,
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `Write a marketing blog about ${topic}. Return JSON: {"title": "string", "body": "string", "imagePrompt": "detailed stable diffusion prompt"}`;
    const result = await model.generateContent(prompt);
    const content = JSON.parse(result.response.text());

    const imageBlob = await hf.textToImage({
      model: CONFIG.HF_MODEL,
      // provider: "hf-inference",
      inputs: content.imagePrompt,
    });

    const buffer = Buffer.from(await imageBlob.arrayBuffer());
    const base64Image = `data:image/png;base64,${buffer.toString("base64")}`;

    res.json({ ...content, image: base64Image });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(CONFIG.PORT, () => console.log(`Studio running on http://localhost:${CONFIG.PORT}`));