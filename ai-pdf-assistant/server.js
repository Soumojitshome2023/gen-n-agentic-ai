// ============================================================================
// 🤖 Project 11: AI PDF Assistant (Mini Project) | RAG with Pinecone Vector Database
// ============================================================================
//
// HOW IT WORKS (RAG Pipeline):
// ┌─────────────┐    ┌──────────┐    ┌───────────┐    ┌──────────┐    ┌─────────┐
// │ Upload PDF  │───▶│ Extract  │───▶│  Chunk    │───▶│ Embed    │───▶│ Store   │
// │             │    │  Text    │    │  Text     │    │ (Gemini) │    │(Pinecone)│
// └─────────────┘    └──────────┘    └───────────┘    └──────────┘    └─────────┘
//
// ┌─────────────┐    ┌──────────┐    ┌───────────┐    ┌──────────┐    ┌─────────┐
// │ User Asks   │───▶│ Embed    │───▶│  Search   │───▶│ Build    │───▶│ Gemini  │
// │ Question    │    │ Question │    │ Pinecone  │    │ RAG Prompt│   │ Answer  │
// └─────────────┘    └──────────┘    └───────────┘    └──────────┘    └─────────┘
//
// WHAT IS RAG?
// RAG (Retrieval-Augmented Generation) is a technique where we:
// 1. Store document content as vector embeddings in a database
// 2. When a user asks a question, we find the most relevant document chunks
// 3. We pass those chunks as context to the AI, so it answers based on YOUR data
//
// WHY PINECONE?
// Pinecone is a cloud-hosted vector database that stores embeddings persistently.
// Unlike in-memory storage, data survives server restarts. Great for production.
//
// ============================================================================

// --- Dependencies ---
import express from "express";          // Web server framework
import multer from "multer";            // Middleware for handling file uploads (PDF)
import fs from "fs";                    // File system — read uploaded files, delete temp files
import pdf from "pdf-parse/lib/pdf-parse.js";  // Extract raw text content from PDF files
import { GoogleGenerativeAI } from "@google/generative-ai";  // Gemini SDK for chat
import { Pinecone } from "@pinecone-database/pinecone";      // Pinecone vector database client
import "dotenv/config";                 // Auto-loads .env file into process.env

const app = express();
app.use(express.json());               // Parse incoming JSON request bodies
app.use(express.static("public"));     // Serve frontend files from /public folder

// Multer config: saves uploaded files to /uploads folder temporarily
const upload = multer({ dest: "uploads/" });

// ==========================================
// ⚙️ Configuration Settings
// ==========================================
const CONFIG = {
  PORT: 3000,
  
  // Model Settings
  CHAT_MODEL: "gemini-3.1-flash-lite",
  EMBEDDING_MODEL: "gemini-embedding-2",
  EMBEDDING_DIMENSION: 512,
  
  // Text Chunking Settings
  CHUNK_SIZE: 500,
  CHUNK_OVERLAP: 50,
  
  // Retrieval Settings
  TOP_K: 3,
};

// ===============================
// AI & Vector DB Connections
// ===============================

// Initialize Gemini SDK — used for generating chat responses
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Pinecone client — connects using API key from .env
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// Get the host URL of our Pinecone index (created in Pinecone Console)
// Index must have 512 dimensions to match our embedding output
const { host } = await pc.describeIndex(process.env.PINECONE_INDEX);

// Create an index reference — all vector operations (upsert, query, delete) use this
const index = pc.index({ host });

// Chat history array — stores conversation turns for multi-turn context
// This allows follow-up questions like "tell me more about that"
let chatHistory = [];

// ===============================
// Helper: Split text into chunks
// ===============================
// WHY CHUNK?
// PDFs can be thousands of characters long. AI models have token limits,
// and embeddings work best on smaller, focused text passages.
// We split the text into ~500 character chunks with 50 char overlap.
//
// WHY OVERLAP?
// Overlap ensures that sentences at chunk boundaries aren't cut off.
// Example: If a sentence spans chars 490-520, without overlap we'd lose it.
// With 50 char overlap, the next chunk starts at 450, capturing the full sentence.
//
// Example: "The quick brown fox jumps over the lazy dog..."
// Chunk 1: chars 0-499    → "The quick brown fox..."
// Chunk 2: chars 450-949  → "...fox jumps over the lazy dog..." (overlaps 50 chars)
function chunkText(text, chunkSize = CONFIG.CHUNK_SIZE, overlap = CONFIG.CHUNK_OVERLAP) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Move forward by (chunkSize - overlap) to create overlapping windows
    start += chunkSize - overlap;
  }

  return chunks;
}

// ===============================
// Helper: Generate Embedding Vector
// ===============================
// WHAT IS AN EMBEDDING?
// An embedding converts text into a numerical vector (array of numbers).
// Similar texts produce similar vectors. This is how we find relevant chunks.
//
// Example:
//   "What is machine learning?" → [0.12, -0.45, 0.78, ...] (512 numbers)
//   "Explain ML algorithms"    → [0.11, -0.44, 0.79, ...] (similar vector!)
//   "Best pizza in town"       → [0.89, 0.23, -0.56, ...] (very different vector)
//
// WHY DIRECT REST API?
// The @google/generative-ai SDK defaults to API v1beta, but the embedding
// model requires v1. So we call the REST API directly to use the correct version.
//
// outputDimensionality: 512 — reduces the default 768-dim output to 512
// for a good balance of accuracy and speed. Your Pinecone index must match!
async function getEmbedding(text) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${CONFIG.EMBEDDING_MODEL}:embedContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: CONFIG.EMBEDDING_MODEL,
        content: { parts: [{ text }] },
        outputDimensionality: CONFIG.EMBEDDING_DIMENSION,        // Must match your Pinecone index dimensions
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Embedding error: ${JSON.stringify(err)}`);
  }

  const data = await response.json();
  return data.embedding.values;           // Returns array of 512 numbers
}

// ===============================
// POST /upload — Upload & Index PDF
// ===============================
// FLOW: Upload PDF → Extract Text → Chunk → Embed → Store in Pinecone
//
// This is the "indexing" phase of RAG. We prepare the document so it
// can be searched later during chat.
app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // STEP 1: Read the uploaded PDF file and extract all text content
    // pdf-parse reads the binary PDF and returns plain text
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdf(dataBuffer);
    const text = pdfData.text;

    // Cleanup: Delete the temporary uploaded file to save disk space
    fs.unlinkSync(req.file.path);

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Could not extract text from PDF" });
    }

    // STEP 2: Split the full text into smaller chunks
    // A 10-page PDF might produce 40-60 chunks of ~500 chars each
    const chunks = chunkText(text);

    // STEP 3: For each chunk, generate an embedding and prepare for Pinecone
    const records = [];

    for (let i = 0; i < chunks.length; i++) {
      // Convert text chunk → 512-dimensional vector via Gemini embedding API
      const embedding = await getEmbedding(chunks[i]);

      // Create a Pinecone record with:
      // - id: unique identifier for this chunk
      // - values: the embedding vector (what Pinecone searches against)
      // - metadata: the original text + info (returned when we search later)
      records.push({
        id: `chunk-${Date.now()}-${i}`,
        values: embedding,
        metadata: {
          text: chunks[i],            // Store original text for retrieval
          chunkIndex: i,              // Track chunk order in document
          source: req.file.originalname,  // Track which PDF this came from
        },
      });
    }

    // STEP 4: Upsert (insert/update) vectors into Pinecone
    // We batch in groups of 50 because Pinecone has limits per request
    for (let i = 0; i < records.length; i += 50) {
      const batch = records.slice(i, i + 50);
      await index.upsert({ records: batch });
    }

    // Reset chat history when a new document is uploaded
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
// FLOW: Question → Embed → Search Pinecone → Build Context → Gemini Answer
//
// This is the "retrieval + generation" phase of RAG. We find relevant
// chunks from the indexed PDF and use them to generate an accurate answer.
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // STEP 1: Convert the user's question into an embedding vector
    // This vector will be compared against all stored chunk vectors
    const questionEmbedding = await getEmbedding(message);

    // STEP 2: Query Pinecone — find the relevant chunks
    // Pinecone compares the question vector against all stored chunk vectors
    // using cosine similarity and returns the closest matches
    const queryResult = await index.query({
      vector: questionEmbedding,
      topK: CONFIG.TOP_K,
      includeMetadata: true,            // Include the original text in results
    });

    // STEP 3: Extract the text from matched chunks and combine them
    // These chunks are the most relevant parts of the PDF for this question
    const context = queryResult.matches
      .map((match) => match.metadata.text)
      .join("\n\n---\n\n");

    // STEP 4: Build the RAG prompt
    // We give Gemini the retrieved context + the user's question
    // and instruct it to answer ONLY from the provided context
    // This prevents hallucination — the AI won't make up information
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

    // STEP 5: Send to Gemini with chat history for multi-turn conversation
    // startChat() with history enables follow-up questions like
    // "tell me more about that" or "can you explain point 2?"
    const model = genAI.getGenerativeModel({ model: CONFIG.CHAT_MODEL });
    const chat = model.startChat({ history: chatHistory });

    const result = await chat.sendMessage(ragPrompt);
    const response = result.response.text();

    // Save updated chat history for the next message
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
// Removes ALL vectors from the Pinecone index and resets chat history
// Use this when switching to a different PDF or starting fresh
app.delete("/clear", async (req, res) => {
  try {
    await index.deleteAll();              // Delete all vectors from Pinecone index
    chatHistory = [];                     // Reset conversation history
    res.json({ message: "Index cleared and chat history reset." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// Start Server
// ===============================
app.listen(CONFIG.PORT, () =>
  console.log(`📄 AI PDF Assistant running at http://localhost:${CONFIG.PORT}`)
);
