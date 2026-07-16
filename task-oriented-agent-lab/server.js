// ============================================================================
// Project 15: Task-Oriented Agent Lab (Agentic AI: Autonomy, Planning, & Memory)
// ============================================================================
//
// WHAT IS AGENTIC AI?
// Agentic AI refers to systems where an AI operates with a high degree of 
// independence (Autonomy), breaks complex tasks into step-by-step lists (Planning),
// and stores results of actions to use for future decisions (Memory).
//
// HOW THIS AGENT WORKS:
// 1. Planning: User inputs a goal. The agent uses Gemini to decompose the goal 
//    into a structured list of steps (a plan), determining which tool is needed for each.
// 2. Memory: The agent maintains a memory array containing the outputs of previously 
//    executed steps.
// 3. Autonomy (Execution Loop): The agent executes each step sequentially, feeding 
//    previous memories into the current step, and auto-corrects or updates state.
//
// ============================================================================

import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

// ==========================================
// ⚙️ Configuration Settings
// ==========================================
const CONFIG = {
  PORT: 3000,
  MODEL_NAME: "gemini-3.1-flash-lite",
  TEMPERATURE: 0.2, // Low temperature for structured planning accuracy
};

const app = express();
app.use(express.json());
app.use(express.static("public"));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: CONFIG.MODEL_NAME,
  generationConfig: { responseMimeType: "application/json" },
});

// ==========================================
// 🔧 Tool Definitions
// ==========================================
// The agent can choose to assign these tools to plan steps.
const TOOLS = {
  SEARCH: "search_database",
  CALCULATE: "calculator",
  WRITE: "report_writer",
};

// Simulated tool functions
async function toolSearchDatabase(query) {
  try {
    // Wikipedia Rest API to retrieve summary extracts of pages
    const cleanQuery = query.trim().replace(/\s+/g, "_");
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery)}`;
    const response = await fetch(url, {
      headers: { "User-Agent": "TaskOrientedAgentLab/1.0 (academic demo)" }
    });

    if (!response.ok) return { error: `No Wikipedia summary found for query: "${query}"` };

    const data = await response.json();
    return {
      title: data.title,
      summary: data.extract,
      description: data.description,
      sourceUrl: data.content_urls?.desktop?.page || ""
    };
  } catch (error) {
    return { error: `Failed to search Wikipedia: ${error.message}` };
  }
}

function toolCalculator(expression) {
  try {
    // Basic arithmetic evaluation safely
    const cleanExpr = expression.replace(/[^0-9+\-*/().\s]/g, "");
    const result = Function(`"use strict"; return (${cleanExpr})`)();
    return { expression: expression, result: Number(result.toFixed(2)) };
  } catch (error) {
    return { error: `Could not evaluate calculation: ${expression}` };
  }
}

// Router to dispatch tools
async function executeTool(toolName, args) {
  console.log(`🔧 Executing Tool [${toolName}] with args:`, args);
  if (toolName === TOOLS.SEARCH) return await toolSearchDatabase(args.query || args);
  if (toolName === TOOLS.CALCULATE) return toolCalculator(args.expression || args);
  return { error: `Tool ${toolName} not supported` };
}

// ==========================================
// 🧠 Execution & Memory API Routes
// ==========================================

// Route 1: Create Plan
app.post("/api/agent/plan", async (req, res) => {
  try {
    const { task } = req.body;
    if (!task) return res.status(400).json({ error: "Task description is required" });

    console.log(`📋 Generating Agent Plan for task: "${task}"`);

    const prompt = `
      You are an agentic planning module. Analyze the user's high-level academic/research task and break it down into a sequence of 5 structured steps to accomplish it.
      
      Available tools you can assign to steps:
      - "search_database": Use this to search Wikipedia summaries for facts or details about a topic. Requires a 'query' argument specifying the topic title.
      - "calculator": Use this for calculations, e.g., calculating years since an event, adding numbers, or other math. Requires an 'expression' argument.
      - "report_writer": Use this for compiling the final answer. Should always be the last step. Requires no external arguments.
      
      Return a JSON object matching this structure exactly:
      {
        "plan": [
          {
            "stepId": 1,
            "description": "Short description of what to do in this step",
            "tool": "search_database",
            "args": { "query": "Artificial Intelligence" }
          },
          ...
        ]
      }
      
      User Task: "${task}"
    `;

    const result = await model.generateContent(prompt);
    const planJSON = JSON.parse(result.response.text());

    res.json({ plan: planJSON.plan });
  } catch (error) {
    console.error("Planning error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Route 2: Execute Step (Autonomous loop run on client or server)
app.post("/api/agent/execute-step", async (req, res) => {
  try {
    const { step, memories } = req.body;
    if (!step) return res.status(400).json({ error: "Step definition is required" });

    const previousMemoryStr = JSON.stringify(memories || []);
    console.log(`🤖 Executing Step ${step.stepId} (${step.tool}) with memory:`, previousMemoryStr);

    let stepResult = null;

    if (step.tool === TOOLS.SEARCH || step.tool === TOOLS.CALCULATE) {
      // 1. Direct tool execution (asynchronous tool execution support)
      stepResult = await executeTool(step.tool, step.args);
    } else if (step.tool === TOOLS.WRITE) {
      // 2. Report writing step using model & memories
      const writerModel = genAI.getGenerativeModel({ model: CONFIG.MODEL_NAME });
      const prompt = `
        You are a task-oriented agent. Write a summary report for the user's task.
        You must compile all information from the previous steps stored in memory.
        
        Previous memories:
        ${previousMemoryStr}
        
        Write a concise, professional report.
      `;
      const result = await writerModel.generateContent(prompt);
      stepResult = { report: result.response.text() };
    } else {
      stepResult = { error: `Unknown tool: ${step.tool}` };
    }

    res.json({
      stepId: step.stepId,
      toolUsed: step.tool,
      result: stepResult,
    });
  } catch (error) {
    console.error("Step execution error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// Start Server
// ===============================
app.listen(CONFIG.PORT, () =>
  console.log(`🤖 Agentic Lab running at http://localhost:${CONFIG.PORT}`)
);
