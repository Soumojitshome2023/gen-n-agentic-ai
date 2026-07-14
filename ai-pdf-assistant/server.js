import express from "express";
import multer from "multer";
import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";
import "dotenv/config";

// ===============================
// App Setup
// ===============================
const app = express();
app.use(express.json());
app.use(express.static("public"));

const upload = multer({ dest: "uploads/" });

// ===============================
// AI & Vector DB Setup
// ===============================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const { host } = await pc.describeIndex(process.env.PINECONE_INDEX);
const index = pc.index({ host });

// Store chat history for multi-turn conversation
let chatHistory = [];

// ===============================
// Helper: Split text into chunks
// ===============================
function chunkText(text, chunkSize = 500, overlap = 50) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    start += chunkSize - overlap;
  }

  return chunks;
}

// ===============================
// Helper: Generate embedding (512 dimensions via v1 API)
// ===============================
async function getEmbedding(text) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-embedding-2:embedContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemini-embedding-2",
        content: { parts: [{ text }] },
        outputDimensionality: 512,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Embedding error: ${JSON.stringify(err)}`);
  }

  const data = await response.json();
  return data.embedding.values;
}

// ===============================
// POST /upload — Upload & Index PDF
// ===============================
app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // 1. Read and parse PDF
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdf(dataBuffer);
    const text = pdfData.text;

    // Cleanup: Remove temp file
    fs.unlinkSync(req.file.path);

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Could not extract text from PDF" });
    }

    // 2. Split into chunks
    const chunks = chunkText(text);

    // 3. Generate embeddings and upsert to Pinecone
    const records = [];

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await getEmbedding(chunks[i]);

      records.push({
        id: `chunk-${Date.now()}-${i}`,
        values: embedding,
        metadata: {
          text: chunks[i],
          chunkIndex: i,
          source: req.file.originalname,
        },
      });
    }

    // Upsert in batches of 50
    for (let i = 0; i < records.length; i += 50) {
      const batch = records.slice(i, i + 50);
      await index.upsert({ records: batch });
    }

    // Reset chat history for new document
    chatHistory = [];

    res.json({
      message: "PDF uploaded and indexed successfully!",
      chunks: chunks.length,
      filename: req.file.originalname,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// POST /chat — Chat with the PDF
// ===============================
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 1. Embed the user's question
    const questionEmbedding = await getEmbedding(message);

    // 2. Query Pinecone for relevant chunks
    const queryResult = await index.query({
      vector: questionEmbedding,
      topK: 3,
      includeMetadata: true,
    });

    // 3. Build context from retrieved chunks
    const context = queryResult.matches
      .map((match) => match.metadata.text)
      .join("\n\n---\n\n");

    // 4. Create RAG prompt
    const ragPrompt = `You are a helpful AI assistant that answers questions based on the provided document context.

DOCUMENT CONTEXT:
${context}

USER QUESTION:
${message}

INSTRUCTIONS:
- Answer the question based ONLY on the provided context.
- If the context does not contain enough information to answer, say so clearly.
- Be concise and accurate.
- Cite relevant parts of the context when possible.`;

    // 5. Generate response with Gemini (multi-turn chat)
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
    const chat = model.startChat({ history: chatHistory });

    const result = await chat.sendMessage(ragPrompt);
    const response = result.response.text();

    // Update chat history
    chatHistory = await chat.getHistory();

    res.json({ response });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// DELETE /clear — Clear index & history
// ===============================
app.delete("/clear", async (req, res) => {
  try {
    await index.deleteAll();
    chatHistory = [];
    res.json({ message: "Index cleared and chat history reset." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// Start Server
// ===============================
app.listen(3000, () =>
  console.log("📄 AI PDF Assistant running at http://localhost:3000")
);
