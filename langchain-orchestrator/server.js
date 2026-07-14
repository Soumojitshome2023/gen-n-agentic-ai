// ============================================================================
// 🦜 LangChain Orchestration — Chains, Memory, and Agents Demo
// ============================================================================
//
// WHAT IS LANGCHAIN?
// LangChain is a framework for developing applications powered by language models.
// It provides standard interfaces and building blocks to connect LLMs with:
// 1. Chains: Sequence multiple LLM calls or actions into a single workflow.
// 2. Memory: Persist conversation state across chat turns.
// 3. Agents: Let the LLM dynamically decide which tools to call and in what order.
//
// This project demonstrates all three core concepts using Google Gemini.
//
// ============================================================================

import express from "express";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate, ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import "dotenv/config";

// ===============================
// App Setup
// ===============================
const app = express();
app.use(express.json());
app.use(express.static("public"));

// Initialize the LangChain Gemini model client
// Uses GEMINI_API_KEY environment variable automatically
const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.1-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
});

// ============================================================================
// 🔗 CONCEPT 1: Chains (LCEL - LangChain Expression Language)
// ============================================================================
// LCEL is a declarative way to compose chains of runnables.
// We chain a Prompt -> LLM -> Output Parser using the `.pipe()` method.
//
// Below we build a Sequential Chain:
// Chain 1: User Input (Topic) ──▶ Name Generator LLM ──▶ Business Name
// Chain 2: Business Name ──▶ Tagline Generator LLM ──▶ Tagline
//
// Combined LCEL Chain:
// User Input ──▶ [Generate Name] ──▶ [Generate Tagline] ──▶ Final JSON
// ============================================================================

const namePrompt = PromptTemplate.fromTemplate(
  "You are a creative business branding expert. Generate ONE catchy, memorable, and modern name for a business that does: {input}. Return ONLY the name itself, nothing else."
);

const taglinePrompt = PromptTemplate.fromTemplate(
  "You are a marketing specialist. Write a clever and memorable tagline (maximum 6 words) for a company named: {businessName}. Return ONLY the tagline itself, nothing else."
);

// Define individual chains
const nameChain = namePrompt.pipe(model).pipe(new StringOutputParser());
const taglineChain = taglinePrompt.pipe(model).pipe(new StringOutputParser());

// Combine them into a Sequential Chain using RunnableSequence
// The output of nameChain is passed to taglineChain via the '{ businessName: nameChain }' mapping
const sequentialChain = RunnableSequence.from([
  {
    // Step 1: Execute nameChain and assign output to the variable "businessName"
    businessName: (input) => nameChain.invoke({ input: input.input }),
  },
  {
    // Step 2: Pass the generated businessName and write a tagline
    businessName: (prev) => prev.businessName,
    tagline: taglineChain,
  }
]);

// Route for Chain Demo
app.post("/api/chain", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: "Topic is required" });

    console.log(`🔗 Executing LangChain LCEL Sequence for: "${topic}"`);

    // Invoke the sequential chain
    const result = await sequentialChain.invoke({ input: topic });

    res.json({
      businessName: result.businessName.trim(),
      tagline: result.tagline.trim(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ============================================================================
// 🧠 CONCEPT 2: Memory
// ============================================================================
// LLMs themselves are stateless — they don't remember previous messages.
// To support conversation, we must pass the chat history back to the model.
// LangChain simplifies this by letting us define a ChatPromptTemplate with a
// MessagesPlaceholder to insert the history dynamically.
// ============================================================================

// In-memory chat history storage (resets on server restart)
let chatMemory = [];

const memoryPrompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a witty, helpful AI assistant. Always keep your answers concise (under 2 sentences)."],
  new MessagesPlaceholder("history"),
  ["human", "{input}"],
]);

const memoryChain = memoryPrompt.pipe(model).pipe(new StringOutputParser());

// Route for Memory Demo
app.post("/api/memory", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    // Convert stored history objects into LangChain message classes (HumanMessage / AIMessage)
    const historyMessages = chatMemory.map((msg) =>
      msg.role === "user"
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content)
    );

    console.log(`🧠 Invoking Chain with memory. History length: ${historyMessages.length}`);

    // Invoke the chain, passing the history messages array to the history placeholder
    const responseText = await memoryChain.invoke({
      input: message,
      history: historyMessages,
    });

    // Save the new turn to history
    chatMemory.push({ role: "user", content: message });
    chatMemory.push({ role: "assistant", content: responseText });

    res.json({
      response: responseText,
      history: chatMemory,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear Memory Route
app.delete("/api/memory", (req, res) => {
  chatMemory = [];
  res.json({ message: "Memory cleared successfully." });
});


// ============================================================================
// 🤖 CONCEPT 3: Agents and Tools
// ============================================================================
// An Agent uses an LLM as a reasoning engine to determine which actions to take
// and which tools to use.
// We define tools, bind them to the Gemini model, and run an execution loop:
// 1. User asks a question
// 2. LLM decides: "Call tool X with arguments Y" or "Here is the final answer"
// 3. If tool called: execute tool, feed results back to LLM, repeat loop.
// ============================================================================

// --- Define Tool Schemas ---
const agentTools = [
  {
    functionDeclarations: [
      {
        name: "getExchangeRate",
        description: "Get the current currency exchange rate between USD and another currency.",
        parameters: {
          type: "object",
          properties: {
            currency: {
              type: "string",
              description: "The target currency code, e.g., 'INR', 'EUR', 'GBP'",
            },
          },
          required: ["currency"],
        },
      },
      {
        name: "getCompanyFounder",
        description: "Get the name of the founder of a popular technology company.",
        parameters: {
          type: "object",
          properties: {
            company: {
              type: "string",
              description: "The name of the company, e.g., 'Google', 'Microsoft', 'Apple', 'SpaceX'",
            },
          },
          required: ["company"],
        },
      },
    ],
  },
];

// --- Implement Tool Functions ---
function getExchangeRate(currency) {
  const rates = {
    INR: 83.5,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 155.2,
    CAD: 1.36,
  };
  const code = currency.toUpperCase().trim();
  return {
    base: "USD",
    target: code,
    rate: rates[code] || (Math.random() * 100 + 1), // Fallback to random rate
  };
}

function getCompanyFounder(company) {
  const founders = {
    google: "Larry Page & Sergey Brin",
    microsoft: "Bill Gates & Paul Allen",
    apple: "Steve Jobs, Steve Wozniak & Ronald Wayne",
    spacex: "Elon Musk",
    facebook: "Mark Zuckerberg",
    tesla: "Martin Eberhard & Marc Tarpenning (co-founded), Elon Musk (early stage investor)",
  };
  const key = company.toLowerCase().trim();
  return {
    company: company,
    founder: founders[key] || "Unknown Founder",
  };
}

// Tool execution router
function executeAgentTool(name, args) {
  if (name === "getExchangeRate") return getExchangeRate(args.currency);
  if (name === "getCompanyFounder") return getCompanyFounder(args.company);
  return { error: `Tool ${name} not found` };
}

// Agent Route
app.post("/api/agent", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    // Bind tools to the model
    const agentModel = model.bind({ tools: agentTools });

    // Turn 1: Ask model if it needs tools
    const response = await agentModel.invoke([new HumanMessage(message)]);
    const toolCalls = response.tool_calls || [];
    const steps = [];

    // Turn 2: If model requested tools, run them and get the final answer
    if (toolCalls.length > 0) {
      const messages = [new HumanMessage(message), response];

      for (const call of toolCalls) {
        console.log(`   ⚙️ Agent tool call: ${call.name}(${JSON.stringify(call.args)})`);
        const toolResult = executeAgentTool(call.name, call.args);

        steps.push({
          tool: call.name,
          args: call.args,
          result: toolResult,
        });

        // Push the ToolMessage response
        messages.push(new ToolMessage({
          content: JSON.stringify(toolResult),
          tool_call_id: call.id,
          name: call.name,
        }));
      }

      // Re-invoke model with the tool results to get the final text answer
      const finalResponse = await model.invoke(messages);
      res.json({ response: finalResponse.content, steps });
    } else {
      // No tools needed, return original answer
      res.json({ response: response.content, steps });
    }
  } catch (error) {
    console.error("Agent error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// Start Server
// ===============================
app.listen(3000, () =>
  console.log("🦜 LangChain Orchestrator running at http://localhost:3000")
);
