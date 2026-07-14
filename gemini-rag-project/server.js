// ============================================================================
// 🧠 Gemini RAG Project — RAG with In-Memory Vector Store (No External DB)
// ============================================================================
//
// HOW IT WORKS (RAG Pipeline):
// ┌─────────────┐    ┌──────────┐    ┌───────────┐    ┌──────────┐    ┌──────────┐
// │ Upload PDF  │───▶│ Extract  │───▶│  Chunk    │───▶│ Embed    │───▶│ Store in │
// │             │    │  Text    │    │  Text     │    │ (Gemini) │    │  Memory  │
// └─────────────┘    └──────────┘    └───────────┘    └──────────┘    └──────────┘
//
// ┌─────────────┐    ┌──────────┐    ┌───────────┐    ┌──────────┐    ┌──────────┐
// │ User Asks   │───▶│ Embed    │───▶│  Cosine   │───▶│ Build    │───▶│ Gemini   │
// │ Question    │    │ Question │    │ Similarity│    │ RAG Prompt│   │ Answer   │
// └─────────────┘    └──────────┘    └───────────┘    └──────────┘    └──────────┘
//
// WHAT IS RAG?
// RAG (Retrieval-Augmented Generation) is a technique where we:
// 1. Store document content as vector embeddings
// 2. When a user asks a question, we find the most relevant document chunks
// 3. We pass those chunks as context to the AI, so it answers based on YOUR data
//
// HOW IS THIS DIFFERENT FROM ai-pdf-assistant?
// ┌─────────────────────────┬──────────────────────┬─────────────────────┐
// │ Feature                 │ ai-pdf-assistant     │ gemini-rag-project  │
// ├─────────────────────────┼──────────────────────┼─────────────────────┤
// │ Vector Storage          │ Pinecone (cloud DB)  │ In-memory (array)   │
// │ Similarity Search       │ Pinecone query()     │ Custom cosine sim   │
// │ API Keys Needed         │ Gemini + Pinecone    │ Gemini only         │
// │ Data Persistence        │ Survives restarts    │ Lost on restart     │
// │ Setup Complexity        │ Create Pinecone index│ Zero setup          │
// │ Best For                │ Production apps      │ Learning & demos    │
// └─────────────────────────┴──────────────────────┴─────────────────────┘
//
// ============================================================================

// --- Dependencies ---
import express from "express";          // Web server framework to handle HTTP requests
import multer from "multer";            // Middleware for handling multipart/form-data (file uploads)
import fs from "fs";                    // File system — read uploaded PDF files, cleanup temp files
import pdf from "pdf-parse/lib/pdf-parse.js";  // Extracts raw text content from PDF binary data
import { GoogleGenerativeAI } from "@google/generative-ai";  // Gemini SDK for chat generation
import "dotenv/config";                 // Auto-loads variables from .env file into process.env

// ===============================
// App Setup
// ===============================
const app = express();
app.use(express.json());               // Enable parsing JSON in request bodies (for /chat route)
app.use(express.static("public"));     // Serve index.html and other frontend files from /public

// Multer config: temporarily saves uploaded PDF files to /uploads directory
// Files are deleted after processing to save disk space
const upload = multer({ dest: "uploads/" });

// ===============================
// Gemini Setup
// ===============================
// Initialize the Gemini SDK — used for generating chat responses (not embeddings)
// Embeddings use the REST API directly (see getEmbedding function below)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ===============================
// In-Memory Vector Store
// ===============================
// Instead of using an external database like Pinecone, we store everything
// in JavaScript arrays. This is simpler but data is lost when the server restarts.
//
// vectorStore structure: [
//   { text: "chunk text...", chunkIndex: 0, embedding: [0.12, -0.45, ...] },
//   { text: "chunk text...", chunkIndex: 1, embedding: [0.34, 0.67, ...] },
//   ...
// ]
let vectorStore = [];

// Chat history — stores previous conversation turns for context
// Enables follow-up questions like "tell me more" or "explain point 2"
let chatHistory = [];

// Track the current uploaded filename for display in the UI
let currentFileName = "";

// ===============================
// Helper: Split text into chunks
// ===============================
// WHY CHUNK?
// PDFs can contain thousands of characters. We can't embed the entire document
// at once because:
// 1. Embedding models have input token limits
// 2. Smaller chunks = more precise similarity search results
// 3. We only want to retrieve the RELEVANT parts, not the whole document
//
// HOW IT WORKS:
// Text: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" (chunkSize=10, overlap=3)
// Chunk 1: "ABCDEFGHIJ"  (chars 0-9)
// Chunk 2: "HIJKLMNOPQ"  (chars 7-16, overlaps 3 chars with chunk 1)
// Chunk 3: "OPQRSTUVWX"  (chars 14-23, overlaps 3 chars with chunk 2)
//
// WHY OVERLAP?
// Without overlap, sentences at chunk boundaries get cut in half.
// Overlap of 50 chars ensures context isn't lost between chunks.
function chunkText(text, chunkSize = 500, overlap = 50) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Slide the window forward by (chunkSize - overlap)
    // This creates the overlapping effect between consecutive chunks
    start += chunkSize - overlap;
  }

  return chunks;
}

// ===============================
// Helper: Generate Embedding Vector via Gemini REST API
// ===============================
// WHAT IS AN EMBEDDING?
// An embedding converts text into a vector (array of 768 numbers).
// Texts with similar meaning produce similar vectors.
//
// Example:
//   "What is machine learning?" → [0.12, -0.45, 0.78, ...] (768 numbers)
//   "Explain ML algorithms"    → [0.11, -0.44, 0.79, ...] (very similar!)
//   "Best pizza in town"       → [0.89, 0.23, -0.56, ...] (very different)
//
// By comparing these vectors (using cosine similarity), we can find
// which chunks of the PDF are most relevant to the user's question.
//
// WHY REST API INSTEAD OF SDK?
// The @google/generative-ai SDK defaults to API version "v1beta",
// but the embedding model requires "v1". So we call the REST endpoint
// directly with the correct API version.
async function getEmbedding(text) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-embedding-2:embedContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemini-embedding-2",
        content: { parts: [{ text }] },
        // No outputDimensionality specified — uses full 768 dimensions
        // (ai-pdf-assistant uses 512 to match its Pinecone index)
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Embedding error: ${JSON.stringify(err)}`);
  }

  const data = await response.json();
  return data.embedding.values;           // Returns array of 768 numbers
}

// ===============================
// Helper: Cosine Similarity
// ===============================
// WHAT IS COSINE SIMILARITY?
// It measures how similar two vectors are, regardless of their magnitude.
// Returns a value between -1 and 1:
//   1.0  = identical direction (very similar text)
//   0.0  = perpendicular (unrelated text)
//  -1.0  = opposite direction (opposite meaning)
//
// FORMULA: cos(θ) = (A · B) / (||A|| × ||B||)
//   A · B    = dot product (sum of element-wise multiplication)
//   ||A||    = magnitude of vector A (square root of sum of squares)
//
// Example:
//   vecA = [1, 2, 3], vecB = [1, 2, 3] → similarity = 1.0 (identical)
//   vecA = [1, 0, 0], vecB = [0, 1, 0] → similarity = 0.0 (unrelated)
//
// WHY COSINE OVER EUCLIDEAN DISTANCE?
// Cosine similarity focuses on the DIRECTION of vectors, not their length.
// This is better for text because longer/shorter texts can still have
// the same meaning, just different vector magnitudes.
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;       // A · B
  let normA = 0;            // ||A||² (will sqrt later)
  let normB = 0;            // ||B||² (will sqrt later)

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];    // Sum of (a₁×b₁ + a₂×b₂ + ...)
    normA += vecA[i] * vecA[i];         // Sum of (a₁² + a₂² + ...)
    normB += vecB[i] * vecB[i];         // Sum of (b₁² + b₂² + ...)
  }

  normA = Math.sqrt(normA);             // √(sum of squares) = vector magnitude
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;  // Avoid division by zero
  return dotProduct / (normA * normB);        // Final cosine similarity score
}

// ===============================
// Helper: Search Similar Chunks
// ===============================
// This replaces Pinecone's query() function.
// It compares the question embedding against ALL stored chunk embeddings,
// calculates similarity scores, sorts by highest score, and returns top K.
//
// This is O(n) — it checks every chunk. Pinecone uses advanced indexing
// (HNSW algorithm) to do this much faster for millions of vectors.
// For small documents (< 1000 chunks), in-memory search is fast enough.
function searchSimilar(queryEmbedding, topK = 3) {
  // Calculate similarity score for every chunk in the store
  const scored = vectorStore.map((entry) => ({
    text: entry.text,
    chunkIndex: entry.chunkIndex,
    score: cosineSimilarity(queryEmbedding, entry.embedding),
  }));

  // Sort by similarity score (highest first = most relevant)
  scored.sort((a, b) => b.score - a.score);

  // Return only the top K most relevant chunks
  return scored.slice(0, topK);
}

// ===============================
// POST /upload — Upload & Index PDF
// ===============================
// FLOW: Upload PDF → Extract Text → Chunk → Embed → Store in Memory
//
// This is the "indexing" phase of RAG. We prepare the document so
// it can be searched later during chat.
app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // STEP 1: Read the uploaded PDF file and extract all text content
    // pdf-parse converts the binary PDF data into plain text
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdf(dataBuffer);
    const text = pdfData.text;

    // Cleanup: Delete the temporary uploaded file to save disk space
    fs.unlinkSync(req.file.path);

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Could not extract text from PDF" });
    }

    // STEP 2: Split the extracted text into smaller chunks
    // A 10-page PDF might produce 40-60 chunks of ~500 chars each
    const chunks = chunkText(text);

    // STEP 3: Clear previous data and prepare for new document
    vectorStore = [];                         // Clear old vectors
    chatHistory = [];                         // Clear old conversation
    currentFileName = req.file.originalname;  // Track filename for UI

    console.log(`📄 Processing ${chunks.length} chunks from "${currentFileName}"...`);

    // STEP 4: For each chunk, generate an embedding and store it
    for (let i = 0; i < chunks.length; i++) {
      // Convert text chunk → 768-dimensional vector via Gemini embedding API
      const embedding = await getEmbedding(chunks[i]);

      // Store the chunk text, its position, and its embedding vector
      // Later, we'll search these embeddings to find relevant chunks
      vectorStore.push({
        text: chunks[i],           // Original text (returned during search)
        chunkIndex: i,             // Position in document
        embedding: embedding,      // 768-dim vector (used for similarity search)
      });

      console.log(`  ✅ Chunk ${i + 1}/${chunks.length} embedded`);
    }

    console.log(`🎉 All ${chunks.length} chunks indexed in memory!\n`);

    res.json({
      message: "PDF uploaded and indexed successfully!",
      chunks: chunks.length,
      filename: currentFileName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// POST /chat — Chat with the PDF
// ===============================
// FLOW: Question → Embed → Cosine Search → Build Context → Gemini Answer
//
// This is the "retrieval + generation" phase of RAG:
// - RETRIEVAL: Find the most relevant chunks using cosine similarity
// - GENERATION: Use those chunks as context for Gemini to generate an answer
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (vectorStore.length === 0) {
      return res.status(400).json({ error: "No PDF indexed yet. Please upload a PDF first." });
    }

    // STEP 1: Convert the user's question into an embedding vector
    // This creates a vector in the same "space" as our chunk embeddings,
    // so we can measure how similar the question is to each chunk
    const questionEmbedding = await getEmbedding(message);

    // STEP 2: Search for the 3 most similar chunks using cosine similarity
    // This is our custom replacement for Pinecone's query() function
    // Each result includes: { text, chunkIndex, score }
    const results = searchSimilar(questionEmbedding, 3);

    // STEP 3: Build context string from the retrieved chunks
    // We format each chunk with its similarity score for transparency
    const context = results
      .map((r, i) => `[Chunk ${i + 1} | Similarity: ${r.score.toFixed(3)}]\n${r.text}`)
      .join("\n\n---\n\n");

    // STEP 4: Build the RAG prompt
    // KEY INSIGHT: We tell the AI to answer ONLY from the provided context.
    // This prevents "hallucination" — the AI won't make up information
    // that isn't in the PDF. If the answer isn't in the chunks, it says so.
    const ragPrompt = `You are a helpful AI assistant that answers questions based on the provided document context.
The document is: "${currentFileName}"

DOCUMENT CONTEXT:
${context}

USER QUESTION:
${message}

INSTRUCTIONS:
- Answer the question based ONLY on the provided context.
- If the context does not contain enough information to answer, say so clearly.
- Be concise and accurate.
- Cite relevant parts of the context when possible.`;

    // STEP 5: Send to Gemini with conversation history
    // startChat() with history enables multi-turn conversation:
    // User: "What is chapter 3 about?"
    // AI: "Chapter 3 covers neural networks..."
    // User: "Tell me more about that" ← AI remembers "that" = neural networks
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
    const chat = model.startChat({ history: chatHistory });

    const result = await chat.sendMessage(ragPrompt);
    const response = result.response.text();

    // Save the updated chat history for the next message
    chatHistory = await chat.getHistory();

    // Return the AI response AND the source chunks with scores
    // The frontend shows these as clickable chips so users can
    // see which parts of the PDF the answer came from
    res.json({
      response,
      sources: results.map((r) => ({
        chunk: r.chunkIndex + 1,
        score: r.score.toFixed(3),
        preview: r.text.substring(0, 100) + "...",
      })),
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// DELETE /clear — Clear store & history
// ===============================
// Resets everything: clears the in-memory vector store and chat history.
// Unlike Pinecone (which persists data in the cloud), our in-memory store
// would also be cleared on server restart anyway.
app.delete("/clear", async (req, res) => {
  try {
    vectorStore = [];          // Remove all stored embeddings
    chatHistory = [];          // Reset conversation history
    currentFileName = "";      // Clear filename tracking
    res.json({ message: "Vector store cleared and chat history reset." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// GET /status — Check index status
// ===============================
// Returns whether a PDF has been indexed, how many chunks are stored,
// and the filename. Useful for the frontend to check state on page load.
app.get("/status", (req, res) => {
  res.json({
    indexed: vectorStore.length > 0,     // Boolean: is anything indexed?
    chunks: vectorStore.length,          // Number of chunks in memory
    filename: currentFileName,           // Name of the uploaded PDF
  });
});

// ===============================
// Start Server
// ===============================
app.listen(3000, () =>
  console.log("📄 Gemini RAG Project running at http://localhost:3000")
);
