// ============================================================================
// 📄 LangChain AI PDF Assistant (RAG with Pinecone & Citation Tracking)
// ============================================================================
//
// HOW IT WORKS:
// 1. PDF Upload & Parse: pdf-parse extracts raw text from PDF.
// 2. LangChain Recursive Splitting: Splits text into chunks intelligently, 
//    respecting paragraphs, sentences, and words to maintain meaning.
// 3. LangChain Embeddings: Generates vectors using GoogleGenAIEmbeddings (512-dim).
// 4. Vector Storage: Indexes the embeddings into a Pinecone Index.
// 5. Semantic Search & Citations: Finds top relevant chunks, returns them as 
//    structured sources, and prompts Gemini to answer citing [Source X].
//
// ============================================================================

import express from "express";
import multer from "multer";
import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
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
// LangChain & Pinecone Setup
// ===============================

// Initialize LangChain Gemini model
const chatModel = new ChatGoogleGenerativeAI({
  model: "gemini-3.1-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.2, // Low temperature for factual RAG answers
});

// Initialize LangChain Embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  modelName: "gemini-embedding-2",
  outputDimensionality: 1024, // Matches the Pinecone index dimensions (1024)
});

// Initialize Pinecone Client
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const { host } = await pc.describeIndex(process.env.PINECONE_INDEX);
const index = pc.index({ host });

// Conversation history
let chatHistory = [];
let currentFileName = "";

// ===============================
// POST /upload — Parse, Chunk, Embed & Index PDF
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

    // 2. LangChain Recursive Character Text Splitting
    // Unlike standard splitters that cut text at hard length boundaries,
    // RecursiveCharacterTextSplitter looks for paragraph breaks (\n\n),
    // line breaks (\n), spaces, and then characters in order.
    // This preserves semantically related sentences in the same chunk.
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });

    console.log("✂️ Splitting PDF text recursively...");
    const docs = await splitter.createDocuments(
      [text],
      [{ source: req.file.originalname }]
    );

    console.log(`📦 Generated ${docs.length} document chunks`);

    // 3. Generate Embeddings & Upsert to Pinecone
    currentFileName = req.file.originalname;
    const records = [];

    for (let i = 0; i < docs.length; i++) {
      // Call GoogleGenAIEmbeddings to generate a 512-dim vector
      // Direct embedding call via LangChain client
      const embedding = (await embeddings.embedQuery(docs[i].pageContent)).slice(0, 1024);

      records.push({
        id: `lc-chunk-${Date.now()}-${i}`,
        values: embedding,
        metadata: {
          text: docs[i].pageContent,
          source: docs[i].metadata.source,
          chunkIndex: i,
        },
      });
    }

    // Upsert in batches of 50 to Pinecone
    for (let i = 0; i < records.length; i += 50) {
      const batch = records.slice(i, i + 50);
      await index.upsert({ records: batch });
    }

    // Reset conversation history for new file
    chatHistory = [];

    res.json({
      message: "PDF uploaded, chunked recursively, and indexed in Pinecone successfully!",
      chunks: docs.length,
      filename: currentFileName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// POST /chat — RAG Query with Citation Tracking
// ===============================
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!currentFileName) {
      return res.status(400).json({ error: "No PDF indexed yet. Please upload a PDF first." });
    }

    // 1. Embed the user query
    const queryEmbedding = (await embeddings.embedQuery(message)).slice(0, 1024);

    // 2. Query Pinecone for relevant documents
    const queryResult = await index.query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true,
    });

    // 3. Build context & citations structure
    // We number each source chunk so the LLM can reference it in its response
    const citations = queryResult.matches.map((match, i) => ({
      id: i + 1,
      text: match.metadata.text,
      source: match.metadata.source || currentFileName,
      score: match.score.toFixed(3),
    }));

    const contextStr = citations
      .map((c) => `[Source ${c.id}]\n${c.text}`)
      .join("\n\n---\n\n");

    // 4. Construct LangChain Chat Prompt Template
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are a document intelligence system. Answer the user's question based ONLY on the provided context.\n\n" +
        "IMPORTANT RULES:\n" +
        "- Cite your sources using [Source X] notation where X is the Source ID (e.g., [Source 1]).\n" +
        "- Place the citations inline at the end of sentences that use information from that source.\n" +
        "- Do not make up information. If the answer is not in the context, say: 'I cannot find the answer in the provided document.'",
      ],
      new MessagesPlaceholder("history"),
      [
        "human",
        `DOCUMENT CONTEXT:\n${contextStr}\n\nQUESTION: {input}`,
      ],
    ]);

    // 5. Format history
    const historyMessages = chatHistory.map((msg) =>
      msg.role === "user"
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content)
    );

    // Chain prompt to the chatModel
    const chain = prompt.pipe(chatModel);

    console.log(`🔍 Querying LangChain chatModel with citations...`);
    const response = await chain.invoke({
      input: message,
      history: historyMessages,
    });

    // Save history
    chatMemoryAdd("user", message);
    chatMemoryAdd("assistant", response.content);

    res.json({
      response: response.content,
      citations: citations.map((c) => ({
        id: c.id,
        preview: c.text.substring(0, 150) + "...",
        score: c.score,
        source: c.source,
      })),
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Helper to manage memory array
function chatMemoryAdd(role, content) {
  chatHistory.push({ role, content });
  if (chatHistory.length > 20) chatHistory.shift(); // Limit history to last 10 turns
}

// ===============================
// DELETE /clear — Clear database and memory
// ===============================
app.delete("/clear", async (req, res) => {
  try {
    await index.deleteAll();
    chatHistory = [];
    currentFileName = "";
    res.json({ message: "Pinecone index cleared and chat memory reset." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// Start Server
// ===============================
app.listen(3000, () =>
  console.log("🦜 LangChain PDF Assistant running at http://localhost:3000")
);
