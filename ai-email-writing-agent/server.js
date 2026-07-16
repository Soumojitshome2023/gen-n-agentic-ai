// ============================================================================
// 🤖 Project 20: AI Email Writing Agent
// ============================================================================

import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KB_PATH = path.join(__dirname, "data.txt");

const CONFIG = {
  PORT: 3000,
  MODEL_NAME: "gemini-3.1-flash-lite",
};

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// In-memory session state for single-user demo
let session = {
  currentAgent: "main", // "main" or "email"
  history: [],          // Chat history array: { role: "user"|"model", text: "", agent: "main"|"email" }
  currentDraft: null,   // The active draft being edited
  isApproved: false,    // Approval state
};

// Helper: Read KB
async function readKnowledgeBase() {
  try {
    return await fs.readFile(KB_PATH, "utf-8");
  } catch (error) {
    console.error("Error reading data.txt knowledge base:", error);
    return "No knowledge base data available.";
  }
}

// Helper: Write KB
async function writeKnowledgeBase(content) {
  try {
    await fs.writeFile(KB_PATH, content, "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing data.txt knowledge base:", error);
    return false;
  }
}

// Helper: Call Gemini with JSON response
async function callGemini(systemPrompt, userPrompt) {
  try {
    const model = genAI.getGenerativeModel({
      model: CONFIG.MODEL_NAME,
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `${systemPrompt}\n\nUser Input/Context:\n${userPrompt}`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw error;
  }
}

// API: Get Knowledge Base
app.get("/api/kb", async (req, res) => {
  const content = await readKnowledgeBase();
  res.json({ content });
});

// API: Update Knowledge Base
app.post("/api/kb", async (req, res) => {
  const { content } = req.body;
  if (content === undefined) {
    return res.status(400).json({ error: "KB content is required." });
  }
  const success = await writeKnowledgeBase(content);
  if (success) {
    res.json({ success: true, message: "Knowledge base updated successfully." });
  } else {
    res.status(500).json({ error: "Failed to save knowledge base." });
  }
});

// API: Reset State
app.post("/api/reset", (req, res) => {
  session = {
    currentAgent: "main",
    history: [],
    currentDraft: null,
    isApproved: false,
  };
  res.json({ success: true, message: "Chat session reset successfully." });
});

// API: Chat Handoff Loop
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // 1. Add user message to history
    session.history.push({ role: "user", text: message, agent: session.currentAgent });

    let responseMessage = "";
    let transitionText = "";

    // 2. Main Agent Execution
    if (session.currentAgent === "main") {
      const mainAgentSystemPrompt = `
        You are the Main Agent, a helpful, friendly general-purpose AI assistant. 
        Your role is to answer user queries or direct them to specialized functions.

        CRITICAL REQUIREMENT:
        If the user wants to write, draft, send, edit, or compose an email, you MUST transition the task to the specialized Email Writing Agent.
        To do this, respond with this exact JSON structure:
        {
          "handoff": "email",
          "message": "A polite, friendly message explaining that you are handing them over to the Email Writing Agent to draft the email."
        }

        If the user is NOT asking to write/draft/compose an email, answer their query normally and output a JSON response matching this schema:
        {
          "handoff": null,
          "message": "Your helpful response here in Markdown format."
        }

        Always output raw JSON. Do not wrap the JSON in markdown formatting.
      `;

      // Build chat context for Main Agent
      const chatContext = session.history
        .map(h => `${h.role === "user" ? "User" : "Agent"}: ${h.text}`)
        .join("\n");

      const response = await callGemini(mainAgentSystemPrompt, chatContext);

      if (response.handoff === "email") {
        console.log("➡️ Handoff from Main Agent to Email Agent triggered.");
        session.currentAgent = "email";
        transitionText = response.message;

        // Perform immediate handoff execution in the same turn for seamless UX!
        // We will call the Email Agent with the user's request context
      } else {
        responseMessage = response.message;
        session.history.push({ role: "model", text: responseMessage, agent: "main" });
        return res.json({
          agent: "main",
          message: responseMessage,
          draft: null,
          isApproved: false,
          transition: false,
        });
      }
    }

    // 3. Email Writing Agent Execution (Or Immediate Handoff Execution)
    if (session.currentAgent === "email") {
      const kb = await readKnowledgeBase();
      const emailAgentSystemPrompt = `
        You are the Email Writing Agent. Your job is to draft a professional, well-structured email based on the user's requirements and the provided Knowledge Base.

        <KNOWLEDGE_BASE>
        ${kb}
        </KNOWLEDGE_BASE>

        INSTRUCTIONS:
        1. Use details from the Knowledge Base (e.g. user's name, company, email signature, and common recipient names) to draft the email. Do not use generic placeholders like "[My Name]" if the information is available in the Knowledge Base.
        2. Determine if you have enough information to draft the email (e.g. recipient, purpose, key details). If not, ask the user for details in your message.
        3. If you have enough information, generate the email draft. The draft should contain both a Subject line and the email Body.
        4. If the user suggests changes, update the draft accordingly.
        5. If the user explicitly approves the email (e.g. they say "approve", "looks good", "looks perfect", "yes", "confirm", or if they clicked the Approve button), you MUST set "approved" to true and "redirect" to true.
        6. Keep the "draft" field populated with the latest complete draft of the email, and use the "message" field to chat with the user.

        Your response MUST be a JSON object matching this structure:
        {
          "draft": "Subject: [Subject]\\n\\n[Email Body]",
          "message": "Your conversation message to the user.",
          "approved": false,
          "redirect": false
        }

        Note:
        - Set "draft" to null if no email has been drafted yet.
        - Set "approved" and "redirect" to true ONLY when the user confirms they approve the draft.
      `;

      // Build chat context for Email Agent
      const chatContext = session.history
        .map(h => `${h.role === "user" ? "User" : "Agent"}: ${h.text}`)
        .join("\n");

      const response = await callGemini(emailAgentSystemPrompt, chatContext);

      // Update active draft in session
      if (response.draft) {
        session.currentDraft = response.draft;
      }

      // Check if user approved draft and email agent wants to redirect back to Main Agent
      if (response.approved && response.redirect) {
        console.log("⬅️ Handoff back from Email Agent to Main Agent triggered.");
        session.isApproved = true;
        session.currentAgent = "main";

        // Double-hop: Call Main Agent to say goodbye and welcome them back
        const welcomeBackSystemPrompt = `
          You are the Main Agent. The user has just approved and finalized their email draft.
          Here is the final approved email:
          "${session.currentDraft}"

          Acknowledge that the email has been successfully approved and finalized, welcome them back to the main assistant panel, and ask if there is anything else you can help them with.
          Return your response as a JSON object:
          {
            "handoff": null,
            "message": "Your response welcoming them back."
          }
        `;

        const welcomeBackResponse = await callGemini(welcomeBackSystemPrompt, `User approved draft: ${session.currentDraft}`);
        
        session.history.push({ role: "model", text: welcomeBackResponse.message, agent: "main" });

        // Save approved draft in logs or clear it for next run, but keep it in UI
        const approvedDraft = session.currentDraft;
        session.currentDraft = null; // Clear active draft for next session
        session.isApproved = false;

        return res.json({
          agent: "main",
          message: welcomeBackResponse.message,
          draft: approvedDraft,
          isApproved: true,
          transition: true,
          transitionMessage: "Email approved! Returning to Main Agent.",
        });
      } else {
        responseMessage = response.message;
        session.history.push({ role: "model", text: responseMessage, agent: "email" });

        return res.json({
          agent: "email",
          message: transitionText ? `${transitionText}\n\n${responseMessage}` : responseMessage,
          draft: session.currentDraft,
          isApproved: false,
          transition: !!transitionText,
        });
      }
    }
  } catch (error) {
    console.error("Chat route error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(CONFIG.PORT, () => {
  console.log(`🤖 AI Email Writing Agent running at http://localhost:${CONFIG.PORT}`);
});
