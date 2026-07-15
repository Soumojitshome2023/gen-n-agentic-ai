// ============================================================================
// 🤖 Project 19: Multimodal Instagram Post Creator Agent
// ============================================================================
//
// WHAT IS THIS?
// A collaborative multi-agent creative writing assistant built with LangGraph.js
// that accepts multiple image uploads, automatically analyzes their visual content
// using Gemini's multimodal vision features, and generates captions, hashtags,
// and verification reports.
//
// WHY DO WE USE THIS?
// Demonstrates how to build a multimodal agent workflow where a Vision Analyst Agent
// inspects image buffers, populates shared graph state with content description,
// and forwards it to down-stream text generator nodes.
//
// ============================================================================

import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph } from "@langchain/langgraph";
import multer from "multer";
import fs from "fs";
import path from "path";
import "dotenv/config";

// --- Configuration ---
const CONFIG = {
  PORT: 3000,
  MODEL_NAME: "gemini-3.1-flash-lite",
  UPLOAD_DIR: "./uploads"
};

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Configure file uploads
const upload = multer({ dest: CONFIG.UPLOAD_DIR });

// Ensure upload directory exists
if (!fs.existsSync(CONFIG.UPLOAD_DIR)) {
  fs.mkdirSync(CONFIG.UPLOAD_DIR, { recursive: true });
}

// Initialize LLM interfaces
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const nativeModel = genAI.getGenerativeModel({ model: CONFIG.MODEL_NAME });

const langchainModel = new ChatGoogleGenerativeAI({
  model: CONFIG.MODEL_NAME,
  apiKey: process.env.GEMINI_API_KEY,
});

// --- LangGraph State Setup ---

// Define State channels (shared memory)
const channels = {
  imageParts: {
    value: (x, y) => y ?? x,
    default: () => [],
  },
  fallbackTopic: {
    value: (x, y) => y ?? x,
    default: () => "",
  },
  topic: {
    value: (x, y) => y ?? x,
    default: () => "",
  },
  tone: {
    value: (x, y) => y ?? x,
    default: () => "casual",
  },
  captions: {
    value: (x, y) => y ?? x,
    default: () => [],
  },
  hashtags: {
    value: (x, y) => y ?? x,
    default: () => [],
  },
  visualPrompt: {
    value: (x, y) => y ?? x,
    default: () => "",
  },
  qaFeedback: {
    value: (x, y) => y ?? x,
    default: () => ({ score: 0, tips: "" }),
  },
};

// Helper to clean Markdown code fences from LLM JSON responses
function cleanJsonString(raw) {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

// --- Agent Nodes ---

// 1. Multimodal Image Analyst Agent
// Inspects the uploaded image(s) to generate a textual topic description.
async function imageAnalystNode(state) {
  if (!state.imageParts || state.imageParts.length === 0) {
    console.log("👁️ Image Analyst Agent: No images uploaded. Falling back to text prompt.");
    return { topic: state.fallbackTopic || "Creative inspiration post" };
  }

  console.log(`👁️ Image Analyst Agent: Reviewing ${state.imageParts.length} uploaded image(s)...`);
  const prompt = "Describe the subject, visual details, color palette, mood, and key elements in these images in 2 concise sentences. This will serve as the topic for social media copy generation.";

  try {
    const parts = [
      prompt,
      ...state.imageParts.map(img => ({
        inlineData: {
          data: img.data,
          mimeType: img.mimeType
        }
      }))
    ];

    const response = await nativeModel.generateContent(parts);
    const description = response.response.text().trim();
    console.log(`Generated Topic: "${description}"`);
    return { topic: description };
  } catch (err) {
    console.error("Image analysis node error:", err);
    return { topic: state.fallbackTopic || "Failed to analyze image content" };
  }
}

// 2. Caption Writer Agent
// Creates 3 caption styles (Hook-based, Narrative, and Short & Punchy)
async function captionWriterNode(state) {
  console.log("✍️ Caption Writer Agent: Drafting captions...");
  const prompt = `
    You are an expert Instagram Copywriter Agent.
    Generate exactly 3 different caption options for a post about: "${state.topic}".
    The tone must be: "${state.tone}".
    
    Format the 3 captions in a JSON list containing objects with "style" and "text" fields.
    Styles should be:
    - "Hook-Based": Start with a highly engaging question or statement.
    - "Narrative/Emotive": Write a brief story or emotional connection.
    - "Short & Punchy": Keep it under 2 lines, using emojis.
    
    Return ONLY a JSON array of this structure:
    [
      { "style": "Hook-Based", "text": "..." },
      { "style": "Narrative/Emotive", "text": "..." },
      { "style": "Short & Punchy", "text": "..." }
    ]
  `;

  const jsonModel = new ChatGoogleGenerativeAI({
    model: CONFIG.MODEL_NAME,
    apiKey: process.env.GEMINI_API_KEY,
    responseMimeType: "application/json",
  });

  const response = await jsonModel.invoke(prompt);
  const captions = JSON.parse(cleanJsonString(response.content));
  return { captions };
}

// 3. Hashtag Strategist Agent
// Selects high-performing tags divided by volume categories (Broad, Niche, Brand)
async function hashtagStrategistNode(state) {
  console.log("🏷️ Hashtag Strategist Agent: Generating hashtag groups...");
  const prompt = `
    You are an expert Social Media SEO and Hashtag Strategist Agent.
    Based on the topic "${state.topic}" and these captions: "${JSON.stringify(state.captions)}",
    recommend exactly 15 high-performing hashtags.
    
    Classify them into a JSON object containing three lists:
    - "Broad": High volume tags (5 tags)
    - "Niche": Target audience tags (5 tags)
    - "Custom": Custom context tags (5 tags)
    
    Return ONLY a JSON object with this structure:
    {
      "broad": ["#tag1", "#tag2", ...],
      "niche": ["#tag6", "#tag7", ...],
      "custom": ["#tag11", "#tag12", ...]
    }
  `;

  const jsonModel = new ChatGoogleGenerativeAI({
    model: CONFIG.MODEL_NAME,
    apiKey: process.env.GEMINI_API_KEY,
    responseMimeType: "application/json",
  });

  const response = await jsonModel.invoke(prompt);
  const hashtags = JSON.parse(cleanJsonString(response.content));
  return { hashtags };
}

// 4. Visual Planner Agent
// Suggests an image prompt or concept to go along with the post
async function visualPlannerNode(state) {
  console.log("🎨 Visual Planner Agent: Designing visual prompt...");
  const prompt = `
    You are an expert Creative Director and Visual Planner Agent.
    For a post about "${state.topic}" with these captions: "${JSON.stringify(state.captions)}",
    suggest a visual prompt or scene description that can be used to capture/generate the matching image.
    Keep the description vivid, detailed, and aesthetic.
    
    Format: Return a paragraph of 3-4 sentences outlining the visual scene concept.
  `;
  const response = await langchainModel.invoke(prompt);
  return { visualPrompt: response.content };
}

// 5. QA Verifier Agent
// Performs checks for emojis, CTAs, guidelines and outputs engagement score (1-10) with suggestions
async function qaVerifierNode(state) {
  console.log("✅ QA Verifier Agent: Grading post parameters...");
  const prompt = `
    You are a Social Media QA Verifier Agent.
    Review the proposed post assets:
    
    Topic: "${state.topic}"
    Captions: ${JSON.stringify(state.captions)}
    Hashtags: ${JSON.stringify(state.hashtags)}
    Visual Prompt: "${state.visualPrompt}"
    
    Perform a quality check:
    1. Readability & Line breaks
    2. Hooks & Call-to-actions (CTAs) present
    3. Hashtag balance (not too few, not spammy)
    
    Return a JSON object containing:
    {
      "score": a number from 1 to 10 grading the potential engagement,
      "tips": "A bulleted markdown checklist recommending 2 key tips or improvements"
    }
  `;

  const jsonModel = new ChatGoogleGenerativeAI({
    model: CONFIG.MODEL_NAME,
    apiKey: process.env.GEMINI_API_KEY,
    responseMimeType: "application/json",
  });

  const response = await jsonModel.invoke(prompt);
  const qaFeedback = JSON.parse(cleanJsonString(response.content));
  return { qaFeedback };
}

// --- Assemble State Graph ---
const workflow = new StateGraph({ channels })
  .addNode("analyst", imageAnalystNode)
  .addNode("writer", captionWriterNode)
  .addNode("strategist", hashtagStrategistNode)
  .addNode("planner", visualPlannerNode)
  .addNode("verifier", qaVerifierNode)
  .addEdge("__start__", "analyst")
  .addEdge("analyst", "writer")
  .addEdge("writer", "strategist")
  .addEdge("strategist", "planner")
  .addEdge("planner", "verifier")
  .addEdge("verifier", "__end__");

const appGraph = workflow.compile();

// --- API Routes ---

// API Route: Trigger Generation Graph with optional image upload
app.post("/api/generate", upload.array("images", 3), async (req, res) => {
  try {
    const { topic, tone } = req.body;
    const files = req.files || [];

    console.log(`🚀 Running multimodal generator graph for tone: ${tone}`);

    // Convert uploaded files to generative base64 inline parts
    const imageParts = files.map(file => {
      const data = fs.readFileSync(file.path).toString("base64");
      // Delete temporary files after reading to avoid disk leak
      fs.unlinkSync(file.path);
      return {
        data,
        mimeType: file.mimetype
      };
    });

    // Run graph workflow
    const result = await appGraph.invoke({
      imageParts,
      fallbackTopic: topic || "",
      tone: tone || "casual"
    });

    res.json({
      topic: result.topic,
      captions: result.captions,
      hashtags: result.hashtags,
      visualPrompt: result.visualPrompt,
      qaFeedback: result.qaFeedback
    });
  } catch (error) {
    console.error("Agent workflow error:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- Start Server ---
app.listen(CONFIG.PORT, () => {
  console.log(`🤖 Instagram Caption Generator Agent running at http://localhost:${CONFIG.PORT}`);
});
