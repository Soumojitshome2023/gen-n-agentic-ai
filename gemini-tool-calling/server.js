// ============================================================================
// 🔧 Gemini Tool Calling — AI Function Calling Demo
// ============================================================================
//
// WHAT IS TOOL CALLING (FUNCTION CALLING)?
// Tool calling allows an LLM to interact with external systems by:
// 1. Receiving a user's natural language request
// 2. Deciding WHICH function/tool to call based on the request
// 3. Generating the correct arguments for that function
// 4. The app executes the function and returns the result
// 5. The LLM uses the result to generate a final natural language response
//
// HOW IT WORKS:
// ┌──────────┐    ┌──────────┐    ┌───────────┐    ┌──────────┐    ┌──────────┐
// │  User:   │───▶│  Gemini  │───▶│  App runs │───▶│  Gemini  │───▶│  Final   │
// │ "Weather │    │ picks    │    │ getWeather│    │ reads    │    │ "It's    │
// │  in NYC" │    │ tool +   │    │ ("NYC")   │    │ result   │    │  22°C.." │
// │          │    │ args     │    │ → {22°C}  │    │          │    │          │
// └──────────┘    └──────────┘    └───────────┘    └──────────┘    └──────────┘
//
// WHY TOOL CALLING?
// - LLMs have a knowledge cutoff and can't access live/private data
// - Tool calling bridges this gap by letting the LLM "use" your APIs
// - The LLM doesn't execute code — it generates a structured request
//   that YOUR application executes safely
//
// PARALLEL TOOL CALLING:
// Modern models can call multiple tools at once. Example:
// User: "Compare weather in Delhi and London"
// Gemini calls: getWeather("Delhi") AND getWeather("London") simultaneously
//
// ============================================================================

import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const app = express();
app.use(express.json());
app.use(express.static("public"));

// ==========================================
// ⚙️ Configuration Settings
// ==========================================
const CONFIG = {
  PORT: 3000,
  
  // Model Settings
  CHAT_MODEL: "gemini-3.1-flash-lite",
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ===============================
// STEP 1: Define the Tools (Functions)
// ===============================
// We define tools as JSON schemas. The LLM reads these schemas to understand:
// - What each tool does (description)
// - What parameters it needs (properties)
// - Which parameters are required
//
// The LLM NEVER executes these functions — it only generates the
// function name + arguments. Our app handles the actual execution.

const tools = [
  {
    functionDeclarations: [
      // ---- Tool 1: Get Weather ----
      // Simulates fetching weather data for a given city
      {
        name: "getWeather",
        description:
          "Get the current weather information for a specific city or location. Returns temperature, condition, and humidity.",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city name, e.g., 'Delhi', 'New York', 'London'",
            },
          },
          required: ["location"],
        },
      },

      // ---- Tool 2: Calculate ----
      // Performs mathematical calculations
      {
        name: "calculate",
        description:
          "Perform a mathematical calculation. Supports basic arithmetic (+, -, *, /), powers, square roots, and percentages.",
        parameters: {
          type: "object",
          properties: {
            expression: {
              type: "string",
              description:
                "The math expression to evaluate, e.g., '25 * 4 + 10', 'sqrt(144)', '15% of 200'",
            },
          },
          required: ["expression"],
        },
      },

      // ---- Tool 3: Get Current Time ----
      // Returns the current date and time for a timezone
      {
        name: "getCurrentTime",
        description:
          "Get the current date and time. If timezone is not specified or set to 'local', it returns the local device/system time.",
        parameters: {
          type: "object",
          properties: {
            timezone: {
              type: "string",
              description:
                "Optional timezone or city name, e.g., 'Asia/Kolkata', 'America/New_York', 'Europe/London', or 'local'.",
            },
          },
        },
      },

      // ---- Tool 4: Search Products ----
      // Simulates searching a product database
      {
        name: "searchProducts",
        description:
          "Search for products in the store by category or keyword. Returns product name, price, and rating.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                "Search query or category, e.g., 'laptops', 'headphones', 'smartphones under 20000'",
            },
            maxResults: {
              type: "number",
              description:
                "Maximum number of results to return (default: 3)",
            },
          },
          required: ["query"],
        },
      },
    ],
  },
];

// ===============================
// STEP 2: Implement the Tool Functions
// ===============================
// These are the ACTUAL functions that run when the LLM calls a tool.
// In a real app, these would call external APIs (weather API, database, etc.)
// Here we use simulated data for demonstration purposes.

// --- Tool Implementation: getWeather ---
// Simulates a weather API response with realistic data
function getWeather(location) {
  // Simulated weather data for different cities
  const weatherData = {
    delhi: { temp: 38, condition: "Sunny & Hot", humidity: 45, wind: "12 km/h" },
    mumbai: { temp: 32, condition: "Humid & Cloudy", humidity: 80, wind: "18 km/h" },
    london: { temp: 15, condition: "Rainy", humidity: 75, wind: "22 km/h" },
    "new york": { temp: 22, condition: "Partly Cloudy", humidity: 55, wind: "15 km/h" },
    tokyo: { temp: 26, condition: "Clear", humidity: 60, wind: "10 km/h" },
    paris: { temp: 18, condition: "Overcast", humidity: 65, wind: "14 km/h" },
    sydney: { temp: 20, condition: "Sunny", humidity: 50, wind: "20 km/h" },
    bangalore: { temp: 28, condition: "Partly Cloudy", humidity: 70, wind: "8 km/h" },
  };

  const key = location.toLowerCase().trim();
  const data = weatherData[key];

  if (data) {
    return {
      location: location,
      temperature: `${data.temp}°C`,
      condition: data.condition,
      humidity: `${data.humidity}%`,
      wind: data.wind,
    };
  }

  // Generate random weather for unknown cities
  return {
    location: location,
    temperature: `${Math.floor(Math.random() * 35 + 5)}°C`,
    condition: ["Sunny", "Cloudy", "Rainy", "Windy"][Math.floor(Math.random() * 4)],
    humidity: `${Math.floor(Math.random() * 60 + 30)}%`,
    wind: `${Math.floor(Math.random() * 25 + 5)} km/h`,
  };
}

// --- Tool Implementation: calculate ---
// Evaluates math expressions safely
function calculate(expression) {
  try {
    // Handle common math expressions
    let expr = expression
      .replace(/sqrt\(([^)]+)\)/gi, "Math.sqrt($1)")   // sqrt(144) → Math.sqrt(144)
      .replace(/(\d+)\s*%\s*of\s*(\d+)/gi, "($1/100)*$2") // 15% of 200 → (15/100)*200
      .replace(/\^/g, "**")                               // 2^3 → 2**3
      .replace(/pi/gi, "Math.PI");                        // pi → Math.PI

    // Safely evaluate the expression
    const result = Function(`"use strict"; return (${expr})`)();
    return {
      expression: expression,
      result: Number(result.toFixed(6)),
    };
  } catch (error) {
    return { expression: expression, error: "Could not evaluate expression" };
  }
}

// --- Tool Implementation: getCurrentTime ---
// Returns current date/time for a given timezone or local device/system timezone
function getCurrentTime(timezone) {
  try {
    const now = new Date();

    // Map common city names to timezone strings
    const tzMap = {
      delhi: "Asia/Kolkata",
      mumbai: "Asia/Kolkata",
      kolkata: "Asia/Kolkata",
      "new york": "America/New_York",
      london: "Europe/London",
      tokyo: "Asia/Tokyo",
      paris: "Europe/Paris",
      sydney: "Australia/Sydney",
      dubai: "Asia/Dubai",
      singapore: "Asia/Singapore",
    };

    // If timezone is not provided, or is 'local'/'device'/'system', use system timezone
    let tz;
    if (!timezone || ["local", "device", "system"].includes(timezone.toLowerCase().trim())) {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } else {
      tz = tzMap[timezone.toLowerCase().trim()] || timezone;
    }

    const formatted = now.toLocaleString("en-US", {
      timeZone: tz,
      dateStyle: "full",
      timeStyle: "long",
    });

    return { timezone: tz, datetime: formatted };
  } catch (error) {
    return { timezone: timezone, error: "Invalid timezone" };
  }
}

// --- Tool Implementation: searchProducts ---
// Simulates a product database search
function searchProducts(query, maxResults = 3) {
  // Simulated product catalog
  const products = [
    { name: "MacBook Pro 14\"", category: "laptops", price: 149900, rating: 4.8 },
    { name: "Dell XPS 15", category: "laptops", price: 129900, rating: 4.6 },
    { name: "HP Pavilion", category: "laptops", price: 65999, rating: 4.2 },
    { name: "Lenovo ThinkPad", category: "laptops", price: 89999, rating: 4.5 },
    { name: "Sony WH-1000XM5", category: "headphones", price: 29990, rating: 4.7 },
    { name: "AirPods Pro 2", category: "headphones", price: 24900, rating: 4.6 },
    { name: "JBL Tune 770NC", category: "headphones", price: 4999, rating: 4.3 },
    { name: "iPhone 16 Pro", category: "smartphones", price: 119900, rating: 4.8 },
    { name: "Samsung Galaxy S24", category: "smartphones", price: 79999, rating: 4.5 },
    { name: "OnePlus 12", category: "smartphones", price: 64999, rating: 4.4 },
    { name: "Google Pixel 9", category: "smartphones", price: 79999, rating: 4.6 },
    { name: "iPad Air M2", category: "tablets", price: 69900, rating: 4.7 },
    { name: "Samsung Galaxy Tab S9", category: "tablets", price: 74999, rating: 4.4 },
  ];

  // Simple search: match by category or keyword in product name
  const q = query.toLowerCase();
  const matches = products.filter(
    (p) =>
      p.category.includes(q) ||
      p.name.toLowerCase().includes(q) ||
      q.includes(p.category)
  );

  return {
    query: query,
    results: matches.slice(0, maxResults).map((p) => ({
      name: p.name,
      price: `₹${p.price.toLocaleString()}`,
      rating: `${p.rating}/5`,
    })),
    totalFound: matches.length,
  };
}

// ===============================
// STEP 3: Tool Dispatcher
// ===============================
// Maps function names (from LLM output) to actual function implementations.
// When Gemini says "call getWeather with location=Delhi", this dispatcher
// routes the call to the correct function.
function executeFunction(name, args) {
  switch (name) {
    case "getWeather":
      return getWeather(args.location);
    case "calculate":
      return calculate(args.expression);
    case "getCurrentTime":
      return getCurrentTime(args.timezone);
    case "searchProducts":
      return searchProducts(args.query, args.maxResults);
    default:
      return { error: `Unknown function: ${name}` };
  }
}

// ===============================
// Store chat history for multi-turn conversations
// ===============================
let chatHistory = [];

// ===============================
// POST /chat — Main chat endpoint with tool calling
// ===============================
// THIS IS THE CORE OF TOOL CALLING:
//
// FLOW:
// 1. User sends a message
// 2. We send it to Gemini WITH the tool definitions
// 3. Gemini decides: "I need to call getWeather(Delhi)"
// 4. We execute getWeather("Delhi") → { temp: 38°C, ... }
// 5. We send the result BACK to Gemini
// 6. Gemini generates a natural language response using the result
//
// For PARALLEL tool calls (e.g., "Compare Delhi and London weather"):
// 3. Gemini says: call getWeather("Delhi") AND getWeather("London")
// 4. We execute BOTH and send BOTH results back
// 5. Gemini combines them into one coherent response
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Initialize Gemini model WITH tool definitions
    // By passing tools, Gemini knows what functions are available
    const model = genAI.getGenerativeModel({
      model: CONFIG.CHAT_MODEL,
      tools: tools,
    });

    // Start a chat with history for multi-turn context
    const chat = model.startChat({ history: chatHistory });

    // Send the user's message to Gemini
    let result = await chat.sendMessage(message);
    let response = result.response;

    // Track which tools were called (for UI display)
    const toolCalls = [];

    // ---- HELPER: Extract function calls from response ----
    // The response.functionCalls() method may not exist in all SDK versions.
    // Instead, we extract function calls directly from the response parts.
    function extractFunctionCalls(resp) {
      try {
        const parts = resp.candidates?.[0]?.content?.parts || [];
        return parts
          .filter((part) => part.functionCall)
          .map((part) => part.functionCall);
      } catch {
        return [];
      }
    }

    // ---- TOOL CALLING LOOP ----
    // Gemini may return function calls instead of text.
    // We execute them and feed results back until Gemini gives a text response.
    // This loop handles:
    // - Single tool calls (e.g., just getWeather)
    // - Parallel tool calls (e.g., getWeather + getCurrentTime at once)
    // - Chained tool calls (result of one tool triggers another)
    let functionCalls = extractFunctionCalls(response);

    while (functionCalls.length > 0) {
      console.log(`\n🔧 Gemini wants to call ${functionCalls.length} tool(s):`);

      // Execute ALL function calls (supports parallel calling)
      const functionResponses = [];

      for (const call of functionCalls) {
        console.log(`   → ${call.name}(${JSON.stringify(call.args)})`);

        // Execute the function using our dispatcher
        const fnResult = executeFunction(call.name, call.args);

        console.log(`   ✅ Result:`, JSON.stringify(fnResult));

        // Track for UI display
        toolCalls.push({
          name: call.name,
          args: call.args,
          result: fnResult,
        });

        // Prepare the response in Gemini's expected format
        functionResponses.push({
          functionResponse: {
            name: call.name,
            response: fnResult,
          },
        });
      }

      // Send ALL function results back to Gemini
      // Gemini will use these to generate the final text response
      result = await chat.sendMessage(functionResponses);
      response = result.response;

      // Check if Gemini wants to call more tools (chained calls)
      functionCalls = extractFunctionCalls(response);
    }

    // Save updated chat history
    chatHistory = await chat.getHistory();

    // Return the final text response + info about which tools were called
    res.json({
      response: response.text(),
      toolCalls: toolCalls,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// DELETE /clear — Reset chat history
// ===============================
app.delete("/clear", (req, res) => {
  chatHistory = [];
  res.json({ message: "Chat history cleared." });
});

// ===============================
// GET /tools — List available tools (for UI)
// ===============================
// Returns the tool schemas so the frontend can display
// what tools are available to the AI
app.get("/tools", (req, res) => {
  const toolList = tools[0].functionDeclarations.map((t) => ({
    name: t.name,
    description: t.description,
  }));
  res.json({ tools: toolList });
});

// ===============================
// Start Server
// ===============================
app.listen(CONFIG.PORT, () =>
  console.log(`🔧 Gemini Tool Calling running at http://localhost:${CONFIG.PORT}`)
);
