// ============================================================================
// Project 16: LangGraph ReAct Loop
// ============================================================================
//
// WHAT IS LANGGRAPH?
// LangGraph is a library for building stateful, multi-actor applications with LLMs.
// It allows you to coordinate multiple agents or create complex decision-making loops
// by structuring your application as a Graph containing:
// 1. Nodes (JavaScript functions that perform actions or make LLM calls)
// 2. Edges (Paths that connect nodes, controlling the direction of execution)
// 3. Shared State (A global memory object that all nodes read from and write to)
//
// WHAT IS A ReAct LOOP?
// ReAct (Reasoning and Acting) is a pattern where an LLM alternates between:
// 1. Thinking (Reasoning)
// 2. Calling a tool (Acting)
// 3. Observing the tool result, then looping back to step 1
//
// Graph flow in this demo:
//
//               [Start]
//                  │
//                  ▼
//          ┌──►(Agent Node)───┐
//          │       │          │
//          │       │          ▼
//          │       │     [End Node] (No Tool Call)
//          │       │
//          │       ▼ (Conditional Edge: Has Tool Call)
//          │   [Action Node] (Runs Tool)
//          └───────┘
//
// ============================================================================

import express from "express";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, ToolMessage } from "@langchain/core/messages";
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

// Bind tools to the model
const modelWithTools = model.bind({
  tools: [
    {
      functionDeclarations: [
        {
          name: "calculate",
          description: "Solve math equations and evaluate arithmetic expressions.",
          parameters: {
            type: "object",
            properties: {
              expression: {
                type: "string",
                description: "Math formula to solve, e.g. '12 * 350 + 200'"
              }
            },
            required: ["expression"]
          }
        },
        {
          name: "getWeather",
          description: "Get the current temperature and weather conditions for a specific city.",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "City name, e.g. 'London', 'Tokyo'"
              }
            },
            required: ["location"]
          }
        },
        {
          name: "getSystemTime",
          description: "Get the current device date, time, and timezone.",
          parameters: {
            type: "object",
            properties: {}
          }
        }
      ]
    }
  ]
});

// Weather Tool (getWeather)
// Calls the wttr.in keyless REST API using fetch to get real-time weather details for any city.
// Input: 'location' - Name of the city to query (e.g. "New York")
// Output: Returns a JSON-string containing location name and weather report string.
async function getWeather(location) {
  try {
    const response = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=3`, {
      headers: { "User-Agent": "wttr/3.0" }
    });
    if (!response.ok) return JSON.stringify({ error: `Could not retrieve weather for: ${location}` });
    const text = await response.text();
    return JSON.stringify({
      location,
      weather: text.trim()
    });
  } catch (error) {
    return JSON.stringify({ error: `Weather API failed: ${error.message}` });
  }
}

// System Time Tool (getSystemTime)
// Fetches the current date, local time, and timezone directly from the host system.
// Output: Returns a JSON-string containing current time, date, and timezone info.
function getSystemTime() {
  const now = new Date();
  return JSON.stringify({
    currentTime: now.toLocaleTimeString(),
    currentDate: now.toLocaleDateString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
}

// Math Calculator Tool (calculate)
// Sanitizes math strings to prevent unsafe code execution, evaluates arithmetic expressions,
// and outputs results rounded to 2 decimal places.
// Input: 'expression' - The math expression to evaluate (e.g. "15 * 30 + 10")
// Output: Returns a JSON-string containing input expression and evaluation result.
function calculate(expression) {
  try {
    const cleanExpr = expression.replace(/[^0-9+\-*/().\s]/g, "");
    const result = Function(`"use strict"; return (${cleanExpr})`)();
    return JSON.stringify({ expression, result: Number(result.toFixed(2)) });
  } catch {
    return JSON.stringify({ error: "Invalid arithmetic expression" });
  }
}

// --- LangGraph Nodes & Config ---

// Define State channels (using messages array reducer)
// 
// WHAT IS THIS?
// This defines the "State" (shared memory) of our graph. 
// A state is made of "channels". Here, we have one channel called "messages".
// 
// WHY DO WE USE THIS?
// 1. "default: () => []" creates an empty list [] as the starting point.
// 2. "value: (x, y) => x.concat(y)" is a reducer function. Every time a node outputs 
//    new messages (x), this function appends (concats) them to the existing messages (y).
//    Without this, new messages would overwrite the old ones instead of appending them.
const channels = {
  messages: {
    value: (x, y) => x.concat(y),
    default: () => [],
  },
};

// 1. Agent node: Calls the LLM to decide on next action
// LangGraph Agent Node (agentNode)
// Takes the current list of messages (history + tool outputs) from state, 
// passes them to the Gemini model bound with weather, time, and math tools, 
// and returns the model's response (AIMessage with or without tool calls).
// Input: 'state' - The current graph state containing the messages array.
// Output: Returns an object containing the new AIMessage update for state.
async function agentNode(state) {
  console.log("🤖 Agent node: Reasoning about task...");
  const response = await modelWithTools.invoke(state.messages);
  // Return update array containing the new response
  return { messages: [response] };
}

// LangGraph Action Node (actionNode)
// Inspects the last message in history to check for tool execution requests.
// Evaluates any matching tool call (calculator, weather, system time)
// and generates standard ToolMessage items containing outputs.
// Input: 'state' - The current graph state containing the messages array.
// Output: Returns an object containing the ToolMessage updates for state.
async function actionNode(state) {
  console.log("🔧 Action node: Executing calculation tool...");
  const lastMessage = state.messages[state.messages.length - 1];
  const toolCalls = lastMessage.tool_calls || [];
  const responses = [];

  for (const call of toolCalls) {
    let toolOutput = "";
    if (call.name === "calculate") {
      toolOutput = calculate(call.args.expression);
    } else if (call.name === "getWeather") {
      toolOutput = await getWeather(call.args.location);
    } else if (call.name === "getSystemTime") {
      toolOutput = getSystemTime();
    } else {
      toolOutput = JSON.stringify({ error: `Tool ${call.name} not found` });
    }

    responses.push(new ToolMessage({
      content: toolOutput,
      tool_call_id: call.id,
      name: call.name
    }));
  }

  return { messages: responses };
}

// LangGraph Conditional Edge Router (shouldContinue)
// Directs flow traffic at Agent Node checkpoints:
// - If the agent's response requests any tool calls, routes to "action" node.
// - If no tool calls are requested, ends graph execution by routing to "__end__".
// Input: 'state' - The current graph state containing the messages array.
// Output: Returns the name of the next node to route execution to ("action" or "__end__").
function shouldContinue(state) {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    console.log("🔁 Router: Tool requested. Heading to Action Node.");
    return "action";
  }
  console.log("🏁 Router: Complete. Heading to End.");
  return "__end__";
}

// 4. Assemble the state graph
// 
// WHAT IS THIS?
// This compiles our nodes and edges into a directed execution graph (a state machine).
//
// HOW IT WORKS:
// 1. "new StateGraph({ channels })" initializes the graph with our shared state configuration.
// 2. ".addNode("name", function)" registers the execution blocks (nodes) for our agents.
// 3. ".addEdge("__start__", "agent")" sets the starting node of the graph to be the "agent".
// 4. ".addConditionalEdges("agent", shouldContinue)" registers a decision gate (router) after 
//    the agent runs. It reads history and decides whether to route to "action" or to end.
// 5. ".addEdge("action", "agent")" routes the flow back to the "agent" node after executing tools,
//    completing the cyclic loop.
const workflow = new StateGraph({ channels })
  .addNode("agent", agentNode)
  .addNode("action", actionNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("action", "agent");

const appGraph = workflow.compile();

// --- API Route ---
app.post("/api/run-loop", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    console.log(`🚀 Starting ReAct agent loop for: "${prompt}"`);

    // Run graph execution
    const responseState = await appGraph.invoke({
      messages: [new HumanMessage(prompt)]
    });

    // Trace path logs & steps for UI
    const stepLogs = responseState.messages.map((msg, i) => {
      let type = "user";
      if (msg.constructor.name === "AIMessage") type = "agent";
      if (msg.constructor.name === "ToolMessage") type = "tool";

      return {
        stepIndex: i + 1,
        type: type,
        content: msg.content,
        toolCalls: msg.tool_calls || null
      };
    });

    res.json({
      steps: stepLogs,
      finalAnswer: responseState.messages[responseState.messages.length - 1].content,
    });
  } catch (error) {
    console.error("Loop error:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- Start Server ---
app.listen(CONFIG.PORT, () =>
  console.log(`🔁 LangGraph ReAct Loop running at http://localhost:${CONFIG.PORT}`)
);
