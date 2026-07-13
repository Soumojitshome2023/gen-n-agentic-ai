import express from "express";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import "dotenv/config";

const app = express();
const upload = multer({ dest: "uploads/" });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to convert local files to Gemini expected format
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

app.use(express.static("public"));

app.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
    const imagePart = fileToGenerativePart(req.file.path, req.file.mimetype);

    const prompt = "Analyze this image in detail and provide a comprehensive description.";
    const result = await model.generateContent([prompt, imagePart]);

    // Cleanup: Remove temporary file after processing to save storage
    fs.unlinkSync(req.file.path);

    res.json({ analysis: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("Vision Assistant running at http://localhost:3000"));