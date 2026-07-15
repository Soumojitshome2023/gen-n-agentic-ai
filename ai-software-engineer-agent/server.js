// ============================================================================
// 🤖 Project 19: AI Software Engineer Agent
// ============================================================================
//
// WHAT IS THIS?
// A collaborative multi-agent workflow built with LangGraph.js that performs
// deep code analysis, security auditing, performance optimization, and final
// verification for any block of code pasted by the user.
//
// WHY DO WE USE THIS?
// Demonstrates how to distribute complex tasks (code review) across specialized
// agents (Analyzer, Auditor, Optimizer) and synthesize their results through a
// final QA/Verifier agent, outputting a complete modification report.
//
// ============================================================================

import express from "express";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph } from "@langchain/langgraph";
import "dotenv/config";

// --- Configuration ---
const CONFIG = {
  PORT: 3000,
  MODEL_NAME: "gemini-3.1-flash-lite",
};

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Initialize LLM model
const model = new ChatGoogleGenerativeAI({
  model: CONFIG.MODEL_NAME,
  apiKey: process.env.GEMINI_API_KEY,
});

// --- LangGraph State Setup ---

// Define State channels (shared memory)
// What is this: A state containing the code string and intermediate reports
// Why we use this: Allows each node to write its specific findings to memory
const channels = {
  code: {
    value: (x, y) => y ?? x,
    default: () => "",
  },
  analysis: {
    value: (x, y) => y ?? x,
    default: () => "",
  },
  security: {
    value: (x, y) => y ?? x,
    default: () => "",
  },
  optimization: {
    value: (x, y) => y ?? x,
    default: () => "",
  },
  report: {
    value: (x, y) => y ?? x,
    default: () => "",
  },
  correctedCode: {
    value: (x, y) => y ?? x,
    default: () => "",
  },
};

// --- Agent Nodes ---

// 1. Code Analyzer Agent Node
// Inspects the code for logical bugs, syntax errors, or compiler issues.
async function analyzerNode(state) {
  console.log("🔍 Analyzer Agent: Reviewing logic...");
  const prompt = `
    You are an expert static code analyzer agent.
    Analyze the following code for logical bugs, compilation issues, or syntax mistakes.
    Provide a concise, 2-bullet summary of your findings.
    
    Code:
    ${state.code}
  `;
  const response = await model.invoke(prompt);
  return { analysis: response.content };
}

// 2. Security Auditor Agent Node
// Inspects the code for security holes, memory leaks, injection, or safety concerns.
async function auditorNode(state) {
  console.log("🛡️ Security Auditor Agent: Searching for vulnerabilities...");
  const prompt = `
    You are an expert cybersecurity code auditor agent.
    Audit the following code for security risks, injection issues, or memory safety concerns.
    Provide a concise, 2-bullet summary of your findings.
    
    Code:
    ${state.code}
  `;
  const response = await model.invoke(prompt);
  return { security: response.content };
}

// 3. Code Optimizer Agent Node
// Inspects the code for performance bottlenecks, speedups, or styling refactors.
async function optimizerNode(state) {
  console.log("⚡ Optimizer Agent: Searching for performance gains...");
  const prompt = `
    You are an expert performance optimization agent.
    Review the following code for speed improvements, refactoring options, or styling cleanup.
    Provide a concise, 2-bullet summary of your findings.
    
    Code:
    ${state.code}
  `;
  const response = await model.invoke(prompt);
  return { optimization: response.content };
}

// 4. QA Verifier Agent Node
// Synthesizes findings from Analyzer, Auditor, and Optimizer nodes,
// and returns both a Markdown report and the corrected, optimized code version as JSON.
async function verifierNode(state) {
  console.log("✅ Verifier Agent: Validating changes and compiling report...");
  const verifierModel = new ChatGoogleGenerativeAI({
    model: CONFIG.MODEL_NAME,
    apiKey: process.env.GEMINI_API_KEY,
    responseMimeType: "application/json",
  });

  const prompt = `
    You are an expert QA and Code Verifier agent.
    Collect and compile the findings from your developer colleagues:
    
    Code Analysis findings:
    ${state.analysis}
    
    Security Audit findings:
    ${state.security}
    
    Performance Optimization suggestions:
    ${state.optimization}
    
    Original Code:
    ${state.code}
    
    Return a JSON object containing:
    {
      "report": "A markdown report summarizing code inspection findings and changes.",
      "correctedCode": "The complete corrected, refactored, and optimized version of the original code. Do not truncate the code. Return the whole code."
    }
  `;
  const response = await verifierModel.invoke(prompt);
  const data = JSON.parse(response.content);
  return { report: data.report, correctedCode: data.correctedCode };
}

// --- Assemble State Graph ---
const workflow = new StateGraph({ channels })
  .addNode("analyzer", analyzerNode)
  .addNode("auditor", auditorNode)
  .addNode("optimizer", optimizerNode)
  .addNode("verifier", verifierNode)
  .addEdge("__start__", "analyzer")
  .addEdge("analyzer", "auditor")
  .addEdge("auditor", "optimizer")
  .addEdge("optimizer", "verifier")
  .addEdge("verifier", "__end__");

const appGraph = workflow.compile();

// --- API Route ---
app.post("/api/agent/analyze", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code content is required" });

    console.log("🚀 Running multi-agent inspection graph...");

    // Run graph workflow
    const result = await appGraph.invoke({ code });

    res.json({
      analysis: result.analysis,
      security: result.security,
      optimization: result.optimization,
      report: result.report,
      correctedCode: result.correctedCode
    });
  } catch (error) {
    console.error("Analysis failure:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- Start Server ---
app.listen(CONFIG.PORT, () => {
  console.log(`🤖 Multi-Agent Review Console running at http://localhost:${CONFIG.PORT}`);
});
