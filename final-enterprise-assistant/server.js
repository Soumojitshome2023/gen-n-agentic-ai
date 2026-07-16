// ============================================================================
// Project 22: Final Enterprise Assistant
// ============================================================================
//
// WHAT IS THIS?
// A full-featured enterprise dashboard featuring simulated authentication, a
// multi-agent LangGraph.js workflow, and persistent local file storage. It integrates:
// 1. Corporate Calendar: Schedule and view meetings via natural language.
// 2. Database Explorer: Direct query filtering of an internal employee database.
// 3. Wiki Knowledge Base: RAG semantic lookup over company policies and details.
//
// ============================================================================

import express from "express";
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

// Initialize Gemini API clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const langchainModel = new ChatGoogleGenerativeAI({
  model: CONFIG.MODEL_NAME,
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.2,
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

// Helper: Load persistent enterprise data
async function loadData() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return {
      users: parsed.users || [],
      calendar: parsed.calendar || [],
      database: parsed.database || [],
      wiki: parsed.wiki || []
    };
  } catch (error) {
    console.error("Error reading data.json. Creating default workspace.", error);
    return { users: [], calendar: [], database: [], wiki: [] };
  }
}

// Helper: Save persistent enterprise data
async function saveData(data) {
  try {
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing data.json:", error);
  }
}

// --- LangGraph Enterprise Graph Setup ---

const channels = {
  query: { value: (x, y) => y ?? x, default: () => "" },
  delegation: { value: (x, y) => y ?? x, default: () => "general" },
  result: { value: (x, y) => y ?? x, default: () => "" },
  context: { value: (x, y) => y ?? x, default: () => null },
};

// 1. Executive Agent (Router)
async function executiveNode(state) {
  console.log("👔 Executive Agent: Analyzing routing for query:", state.query);
  const prompt = `
    You are the Executive Router Agent for an enterprise dashboard.
    Analyze the user request: "${state.query}"
    
    Determine which specialist agent is best suited to handle this task:
    - "database": For querying employee details, departments, roles, salaries, or roster lists.
    - "calendar": For booking, listing, checking, or scheduling meetings and calendars.
    - "wiki": For checking corporate policies, office wi-fi, IT support contacts, or generic office procedures.
    - "general": For generic greetings or chats that don't involve database or scheduling.
    
    Return a strict JSON object:
    {
      "delegation": "database" | "calendar" | "wiki" | "general",
      "reason": "Brief reason why this agent was chosen"
    }
  `;

  const jsonModel = new ChatGoogleGenerativeAI({
    model: CONFIG.MODEL_NAME,
    apiKey: process.env.GEMINI_API_KEY,
    responseMimeType: "application/json",
  });

  const response = await jsonModel.invoke(prompt);
  const decision = JSON.parse(cleanJsonString(response.content));
  return { delegation: decision.delegation };
}

// 2. Database Specialist Agent
async function databaseNode(state) {
  console.log("📊 Database Agent: Analyzing roster database...");
  const data = await loadData();
  const dbSchema = JSON.stringify(data.database);

  const prompt = `
    You are the Database Specialist Agent.
    The user is asking: "${state.query}"
    
    Here is the active employee database:
    ${dbSchema}
    
    Perform the necessary filtering, calculations (average salary, count, department matching), or searches.
    Produce a friendly, professional Markdown report explaining the data findings.
  `;

  const response = await langchainModel.invoke(prompt);
  return { result: response.content };
}

// 3. Calendar Specialist Agent
async function calendarNode(state) {
  console.log("📅 Calendar Agent: Interacting with corporate scheduling...");
  const data = await loadData();
  const currentCalendar = JSON.stringify(data.calendar);

  // Ask Gemini if this is an attempt to create an event or query events
  const actionPrompt = `
    You are a Corporate Scheduling assistant.
    User request: "${state.query}"
    
    We need to determine if the user wants to ADD/SCHEDULE a meeting, or if they are simply QUERYING/LISTING events.
    Return a strict JSON object:
    {
      "action": "schedule" | "list",
      "title": "Meeting Title (if scheduling, else null)",
      "date": "YYYY-MM-DD (if scheduling, else null)",
      "time": "HH:MM (if scheduling, else null)",
      "attendees": "Who is attending (if scheduling, else null)",
      "description": "Details (if scheduling, else null)"
    }
  `;

  const jsonModel = new ChatGoogleGenerativeAI({
    model: CONFIG.MODEL_NAME,
    apiKey: process.env.GEMINI_API_KEY,
    responseMimeType: "application/json",
  });

  const actionResponse = await jsonModel.invoke(actionPrompt);
  const details = JSON.parse(cleanJsonString(actionResponse.content));

  if (details.action === "schedule" && details.title && details.date) {
    const newEvent = {
      id: Date.now(),
      title: details.title,
      date: details.date,
      time: details.time || "12:00",
      attendees: details.attendees || "Team",
      description: details.description || "",
    };
    data.calendar.push(newEvent);
    await saveData(data);

    return {
      result: `✅ **Meeting Scheduled!**\n- **Event:** ${newEvent.title}\n- **Date:** ${newEvent.date} at ${newEvent.time}\n- **Attendees:** ${newEvent.attendees}\n- **Description:** ${newEvent.description}\n\n*Event context synced to data.json.*`
    };
  } else {
    // List existing matching events or summarize calendar
    const summaryPrompt = `
      Based on the corporate calendar events:
      ${currentCalendar}
      
      Respond to the user's query: "${state.query}"
      Format the matching events in a neat markdown layout.
    `;
    const summaryResponse = await langchainModel.invoke(summaryPrompt);
    return { result: summaryResponse.content };
  }
}

// 4. Wiki Specialist Agent (RAG)
async function wikiNode(state) {
  console.log("📚 Wiki Agent: Scanning corporate knowledge base...");
  const data = await loadData();
  const wikiArticles = data.wiki;

  // Simulate semantic/keyword retrieval by scanning title & content for matches
  const keywordPrompt = `
    Identify 2-3 key terms or nouns from the query: "${state.query}"
    Return a strict JSON list of strings, e.g.: ["wifi", "password"]
  `;

  const jsonModel = new ChatGoogleGenerativeAI({
    model: CONFIG.MODEL_NAME,
    apiKey: process.env.GEMINI_API_KEY,
    responseMimeType: "application/json",
  });

  const keywordResponse = await jsonModel.invoke(keywordPrompt);
  const keywords = JSON.parse(cleanJsonString(keywordResponse.content));

  // Filter wiki articles that contain any of the keywords safely
  const matchedArticles = wikiArticles.filter(art => {
    return keywords.some(kw => {
      const cleanKw = kw.toLowerCase();
      return art.title.toLowerCase().includes(cleanKw) || art.content.toLowerCase().includes(cleanKw);
    });
  });

  const contextText = matchedArticles.length > 0
    ? matchedArticles.map(art => `Title: ${art.title}\nContent: ${art.content}`).join("\n\n")
    : "No highly matching articles found in knowledge base.";

  const prompt = `
    You are the Wiki Specialist Agent.
    Use the following corporate articles to answer the user query:
    
    <WIKI_CONTEXT>
    ${contextText}
    </WIKI_CONTEXT>
    
    User Query: "${state.query}"
    
    Provide an accurate, context-aware answer citing the relevant policy.
  `;

  const response = await langchainModel.invoke(prompt);
  return { result: response.content };
}

// 5. General Agent
async function generalNode(state) {
  console.log("💬 General Agent: Responding to general query...");
  const prompt = `
    You are a general corporate assistant. Respond to the message: "${state.query}"
    Keep it professional, helpful, and concise.
  `;
  const response = await langchainModel.invoke(prompt);
  return { result: response.content };
}

// Router routing logic based on executive delegation state
function routerEdge(state) {
  return state.delegation;
}

// Assemble the StateGraph workflow
const workflow = new StateGraph({ channels })
  .addNode("executive", executiveNode)
  .addNode("database", databaseNode)
  .addNode("calendar", calendarNode)
  .addNode("wiki", wikiNode)
  .addNode("general", generalNode)
  .addEdge("__start__", "executive")
  .addConditionalEdges("executive", routerEdge, {
    database: "database",
    calendar: "calendar",
    wiki: "wiki",
    general: "general",
  })
  .addEdge("database", "__end__")
  .addEdge("calendar", "__end__")
  .addEdge("wiki", "__end__")
  .addEdge("general", "__end__");

const compiledGraph = workflow.compile();

// --- HTTP API Endpoints ---

// API: Authentication
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const data = await loadData();
  const matchedUser = data.users.find(u => u.username === username && u.password === password);

  if (matchedUser) {
    res.json({ success: true, user: { username: matchedUser.username, role: matchedUser.role } });
  } else {
    res.status(401).json({ error: "Invalid corporate credentials." });
  }
});

// API: Get Database List
app.get("/api/database", async (req, res) => {
  const data = await loadData();
  res.json({ database: data.database });
});

// API: Add Employee
app.post("/api/database", async (req, res) => {
  const { name, role, department, salary, joinDate } = req.body;
  if (!name || !role || !department || !salary) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const data = await loadData();
  const newEmp = {
    id: data.database.length + 1,
    name,
    role,
    department,
    salary: Number(salary),
    joinDate: joinDate || new Date().toISOString().split("T")[0],
  };

  data.database.push(newEmp);
  await saveData(data);
  res.json({ success: true, employee: newEmp });
});

// API: Get Calendar List
app.get("/api/calendar", async (req, res) => {
  const data = await loadData();
  res.json({ calendar: data.calendar });
});

// API: Get Wiki List
app.get("/api/wiki", async (req, res) => {
  const data = await loadData();
  res.json({ wiki: data.wiki });
});

// API: Add Wiki Article
app.post("/api/wiki", async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content required." });
  }

  const data = await loadData();
  const newArticle = {
    id: data.wiki.length + 1,
    title,
    content,
  };

  data.wiki.push(newArticle);
  await saveData(data);
  res.json({ success: true, article: newArticle });
});

// API: Core LangGraph Agent Assistant Chat trigger
app.post("/api/chat", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required." });
    }

    console.log("🚀 Executing Enterprise Agent Loop...");
    const result = await compiledGraph.invoke({ query });

    res.json({
      success: true,
      delegation: result.delegation,
      result: result.result,
    });

  } catch (error) {
    console.error("Agent execution failed:", error);
    res.status(500).json({ error: "Enterprise Agent failed: " + error.message });
  }
});

// Start Server
app.listen(CONFIG.PORT, () => {
  console.log(`💼 Final Enterprise Assistant running at http://localhost:${CONFIG.PORT}`);
});
