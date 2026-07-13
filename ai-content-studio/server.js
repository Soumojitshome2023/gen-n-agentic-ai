import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HfInference } from "@huggingface/inference";
import "dotenv/config";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const hf = new HfInference(process.env.HF_TOKEN);

app.post("/api/generate", async (req, res) => {
  try {
    const { topic } = req.body;
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `Write a marketing blog about ${topic}. Return JSON: {"title": "string", "body": "string", "imagePrompt": "detailed stable diffusion prompt"}`;
    const result = await model.generateContent(prompt);
    const content = JSON.parse(result.response.text());

    const imageBlob = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      provider: "hf-inference",
      inputs: content.imagePrompt,
    });

    const buffer = Buffer.from(await imageBlob.arrayBuffer());
    const base64Image = `data:image/png;base64,${buffer.toString("base64")}`;

    res.json({ ...content, image: base64Image });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("Studio running on http://localhost:3000"));