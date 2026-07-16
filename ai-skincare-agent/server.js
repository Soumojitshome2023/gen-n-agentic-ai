// ============================================================================
// 🤖 Project 21: AI Skincare Assistant & Routine Planner Agent
// ============================================================================
//
// WHAT IS THIS?
// A full-stack multi-agent application built with LangGraph.js, Express, and
// Google Gemini that acts as a personalized skincare assistant. It offers:
// 1. Persistent Skin Profile & Routine: Saved locally inside `data.json` for daily access.
// 2. Multimodal Vision Analysis: Analyzes face skin concerns or product ingredient lists from uploads.
// 3. Multi-Agent Workflow: Uses LangGraph nodes to analyze skin type, plan routines, and audit ingredient safety.
//
// ============================================================================

import express from "express";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph } from "@langchain/langgraph";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "data.json");

const CONFIG = {
  PORT: 3000,
  MODEL_NAME: "gemini-3.1-flash-lite",
};

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
try {
  await fs.access(uploadDir);
} catch {
  await fs.mkdir(uploadDir, { recursive: true });
}

// Multer config for file uploads
const upload = multer({ dest: "uploads/" });

// Initialize Gemini SDK clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const langchainModel = new ChatGoogleGenerativeAI({
  model: CONFIG.MODEL_NAME,
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.3,
});

// Helper: Clean Markdown wrappers from LLM JSON responses
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

// Helper: Load persistent skincare data
async function loadData() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading data.json. Initializing defaults.", error);
    const defaults = {
      profile: { skinType: "Combination", concerns: ["Dullness"], budget: "Mid-range", allergies: "" },
      routine: { am: [], pm: [] },
      safetyAudit: { score: 10, tips: "No conflicts detected." },
      analysisResult: ""
    };
    await saveData(defaults);
    return defaults;
  }
}

// Helper: Save persistent skincare data
async function saveData(data) {
  try {
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error saving data.json:", error);
  }
}

// --- LangGraph Multi-Agent Setup ---

// Define State Channels
const channels = {
  profile: {
    value: (x, y) => y ?? x,
    default: () => ({}),
  },
  imageBuffer: {
    value: (x, y) => y ?? x,
    default: () => null,
  },
  imageMimeType: {
    value: (x, y) => y ?? x,
    default: () => null,
  },
  analysisResult: {
    value: (x, y) => y ?? x,
    default: () => "",
  },
  routine: {
    value: (x, y) => y ?? x,
    default: () => ({ am: [], pm: [] }),
  },
  safetyAudit: {
    value: (x, y) => y ?? x,
    default: () => ({ score: 10, tips: "" }),
  },
};

// 1. Profiler Agent
async function profilerNode(state) {
  console.log("👤 Profiler Agent: Organizing skin profile parameters...");
  return { profile: state.profile };
}

// 2. Multimodal Analyst Agent
async function analystNode(state) {
  if (!state.imageBuffer) {
    console.log("👁️ Analyst Agent: No image uploaded. Skipping visual analysis.");
    return { analysisResult: "No skin or product photo uploaded." };
  }

  console.log("👁️ Analyst Agent: Running multimodal vision analysis...");
  try {
    const visionModel = genAI.getGenerativeModel({ model: CONFIG.MODEL_NAME });
    const imagePart = {
      inlineData: {
        data: state.imageBuffer.toString("base64"),
        mimeType: state.imageMimeType || "image/png",
      },
    };

    const prompt = `
      You are an expert Skincare Analyst Agent.
      Please inspect this image and extract relevant details:
      - If it is a face/skin photo, visually describe the skin texture, obvious oily zones, dry patches, redness, or acne concerns.
      - If it is a product ingredient label, extract and list the visible active ingredients (e.g. Salicylic Acid, Retinol, Niacinamide, Alcohol Denat).
      
      Provide a concise 3-4 sentence descriptive summary of your analysis. Be professional, direct, and constructive.
    `;

    const result = await visionModel.generateContent([prompt, imagePart]);
    return { analysisResult: result.response.text() };
  } catch (error) {
    console.error("Analyst Agent Vision check failed:", error);
    return { analysisResult: "Vision analysis failed or timed out." };
  }
}

// 3. Routine Planner Agent
async function routinePlannerNode(state) {
  console.log("🧪 Routine Planner Agent: Crafting AM/PM routine...");
  const prompt = `
    You are an expert Cosmetic Chemist and Routine Planner Agent.
    Based on the user profile:
    - Skin Type: ${state.profile.skinType}
    - Concerns: ${state.profile.concerns.join(", ")}
    - Budget: ${state.profile.budget}
    - Allergies/Sensitivities: ${state.profile.allergies || "None"}
    
    And the image analysis report (if any):
    "${state.analysisResult}"
    
    Recommend a simple, structured AM and PM skincare routine.
    Each routine step must include:
    - "step": Number of the step (e.g., 1, 2)
    - "category": Type of product (e.g., Cleanser, Toner, Serum, Moisturizer, SPF)
    - "ingredients": Key active ingredients suggested (e.g., Hyaluronic Acid, Salicylic Acid)
    - "instructions": Brief usage instructions (e.g., Apply to damp skin, pat gently)
    
    Format the output as a strict JSON object:
    {
      "am": [
        { "step": 1, "category": "Cleanser", "ingredients": "...", "instructions": "..." }
      ],
      "pm": [
        { "step": 1, "category": "Cleanser", "ingredients": "...", "instructions": "..." }
      ]
    }
    
    Only return raw JSON. Do not include markdown code block syntax.
  `;

  const jsonModel = new ChatGoogleGenerativeAI({
    model: CONFIG.MODEL_NAME,
    apiKey: process.env.GEMINI_API_KEY,
    responseMimeType: "application/json",
  });

  const response = await jsonModel.invoke(prompt);
  const routine = JSON.parse(cleanJsonString(response.content));
  return { routine };
}

// 4. Safety Verifier Agent
async function safetyVerifierNode(state) {
  console.log("🛡️ Safety Verifier Agent: Auditing ingredient safety...");
  const prompt = `
    You are a Dermatological Safety Auditor Agent.
    Review the proposed routine:
    AM: ${JSON.stringify(state.routine.am)}
    PM: ${JSON.stringify(state.routine.pm)}
    
    User Profile:
    - Skin Type: ${state.profile.skinType}
    - Allergies: ${state.profile.allergies || "None"}
    - Visual skin report: "${state.analysisResult}"
    
    Perform a complete safety audit:
    1. Check for conflicting ingredients used together (e.g. Retinol + Benzoyl Peroxide/Vitamin C at the same time).
    2. Check if any product is too harsh for their skin type (e.g. high-percentage acids for Sensitive/Dry skin).
    
    Return a JSON object containing:
    {
      "score": a safety compatibility score from 1 to 10 (where 10 is perfectly safe and compatible),
      "tips": "A bulleted markdown checklist with 2-3 specific suggestions or alerts"
    }
    
    Only return raw JSON. Do not include markdown code block syntax.
  `;

  const jsonModel = new ChatGoogleGenerativeAI({
    model: CONFIG.MODEL_NAME,
    apiKey: process.env.GEMINI_API_KEY,
    responseMimeType: "application/json",
  });

  const response = await jsonModel.invoke(prompt);
  const safetyAudit = JSON.parse(cleanJsonString(response.content));
  return { safetyAudit };
}

// Assemble the StateGraph workflow
const workflow = new StateGraph({ channels })
  .addNode("profiler", profilerNode)
  .addNode("analyst", analystNode)
  .addNode("planner", routinePlannerNode)
  .addNode("verifier", safetyVerifierNode)
  .addEdge("__start__", "profiler")
  .addEdge("profiler", "analyst")
  .addEdge("analyst", "planner")
  .addEdge("planner", "verifier")
  .addEdge("verifier", "__end__");

const compiledGraph = workflow.compile();

// --- HTTP Server Endpoints ---

// Endpoint: Get saved profile context
app.get("/api/data", async (req, res) => {
  const data = await loadData();
  res.json(data);
});

// Endpoint: Direct update of user profile
app.post("/api/profile", async (req, res) => {
  const { skinType, concerns, budget, allergies } = req.body;
  if (!skinType || !concerns || !budget) {
    return res.status(400).json({ error: "Missing required profile options." });
  }

  const currentData = await loadData();
  currentData.profile = { skinType, concerns, budget, allergies };
  await saveData(currentData);

  res.json({ success: true, message: "Profile saved.", profile: currentData.profile });
});

// Endpoint: Run LangGraph Agent workflow
app.post("/api/analyze", upload.single("image"), async (req, res) => {
  try {
    const { skinType, concerns, budget, allergies } = req.body;
    const parsedConcerns = Array.isArray(concerns) ? concerns : [concerns].filter(Boolean);

    const profile = {
      skinType: skinType || "Combination",
      concerns: parsedConcerns,
      budget: budget || "Mid-range",
      allergies: allergies || "",
    };

    let imageBuffer = null;
    let imageMimeType = null;

    if (req.file) {
      imageBuffer = await fs.readFile(req.file.path);
      imageMimeType = req.file.mimetype;
      // Cleanup temporary file in background
      fs.unlink(req.file.path).catch(err => console.error("Temp file cleanup failed:", err));
    }

    console.log("🚀 Running Skincare LangGraph pipeline...");
    const result = await compiledGraph.invoke({
      profile,
      imageBuffer,
      imageMimeType,
    });

    // Save outputs back to persistent store
    const fullData = {
      profile: result.profile,
      routine: result.routine,
      safetyAudit: result.safetyAudit,
      analysisResult: result.analysisResult,
    };
    await saveData(fullData);

    res.json({
      success: true,
      ...fullData
    });

  } catch (error) {
    console.error("Skincare Agent generation failed:", error);
    res.status(500).json({ error: "Agent execution failed: " + error.message });
  }
});

// Start Server
app.listen(CONFIG.PORT, () => {
  console.log(`🤖 Skincare Planner Agent running at http://localhost:${CONFIG.PORT}`);
});
