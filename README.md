# 🤖 Generative AI & Agentic AI for Engineers

A hands-on collection of **18 projects** that progressively teach you how to build real-world applications with **Google Gemini**, **Hugging Face**, **Pinecone**, **LangChain**, and **LangGraph** — from your first API call to full-stack AI-powered web apps.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Repository Structure](#-repository-structure)
- [Projects](#-projects)
  - [1. Hello AI Project](#1--hello-ai-project)
  - [2. Prompt Playground](#2--prompt-playground)
  - [3. Stream AI Response](#3--stream-ai-response)
  - [4. AI Chatbot Project](#4--ai-chatbot-project)
  - [5. Vision Applications](#5--vision-applications)
  - [6. AI Vision Assistant](#6--ai-vision-assistant)
  - [7. Hugging Face Image Generator](#7--hugging-face-image-generator)
  - [8. AI Content Studio](#8--ai-content-studio)
  - [9. Pinecone RAG Demo](#9--pinecone-rag-demo)
  - [10. AI PDF Assistant (Mini Project)](#10--ai-pdf-assistant-mini-project)
  - [11. Gemini RAG Project](#11--gemini-rag-project)
  - [12. Gemini Tool Calling](#12--gemini-tool-calling)
  - [13. LangChain Orchestrator](#13--langchain-orchestrator)
  - [14. LangChain PDF Assistant (RAG)](#14--langchain-pdf-assistant-rag)
  - [15. Task-Oriented Agent Lab](#15--task-oriented-agent-lab)
  - [16. Researcher-Writer Agent Duo](#16--researcher-writer-agent-duo)
  - [17. LangGraph ReAct Loop](#17--langgraph-react-loop)
  - [18. AI Software Engineer Agent](#18--ai-software-engineer-agent)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [API Keys Setup](#-api-keys-setup)
- [Tech Stack](#-tech-stack)
- [License](#-license)

---

## 🌟 Overview

This repository is structured as a **learning path** for engineers who want to master Generative AI integration. Each project builds upon the concepts of the previous one, covering:

| Concept                     | Projects                                      |
| --------------------------- | --------------------------------------------- |
| Basic API Integration       | Hello AI, Prompt Playground                   |
| Streaming Responses         | Stream AI Response                            |
| Multi-turn Conversations    | AI Chatbot                                    |
| Vision / Multimodal AI      | Vision Applications, AI Vision Assistant       |
| Image Generation            | Hugging Face Image Generator                  |
| Multi-API Orchestration     | AI Content Studio                             |
| Vector Database (CRUD)     | Pinecone RAG Demo                             |
| RAG / PDF Q&A              | AI PDF Assistant                              |
| RAG (No External DB)       | Gemini RAG Project                            |
| Tool / Function Calling    | Gemini Tool Calling                           |
| LLM Orchestration          | LangChain Orchestrator                        |
| RAG with LangChain & Citations | LangChain PDF Assistant                   |
| Agentic AI (Planning & Memory) | Task-Oriented Agent Lab                   |
| Multi-Agent Collaboration      | Researcher-Writer Agent Duo               |
| Cyclic Agent Loops (ReAct)    | LangGraph ReAct Loop                      |
| Autonomous Coding Agents      | AI Software Engineer Agent                |

---

## 📁 Repository Structure

```
Generative AI & Agentic AI for Engineers/
├── hello-ai-project/          # 🟢 Your first Gemini API call
│   ├── index.js
│   ├── .env
│   └── package.json
│
├── prompt-playground/         # 🎛️ Experiment with prompts, temperature & tokens
│   ├── server.js
│   ├── public/index.html
│   ├── .env
│   └── package.json
│
├── stream-ai-response/        # ⚡ Real-time streaming AI responses
│   ├── server.js
│   ├── public/index.html
│   ├── .env
│   └── package.json
│
├── ai-chatbot-project/        # 💬 Multi-turn conversational chatbot
│   ├── server.js
│   ├── public/index.html
│   ├── .env
│   └── package.json
│
├── vision-applications/       # 👁️ CLI-based image analysis
│   ├── index.js
│   ├── test-img.png
│   ├── .env
│   └── package.json
│
├── ai-vision-assistant/       # 🖼️ Web-based image upload & analysis
│   ├── server.js
│   ├── public/index.html
│   ├── uploads/
│   ├── .env
│   └── package.json
│
├── hugging-face-gen/          # 🎨 Text-to-image generation with FLUX
│   ├── index.js
│   ├── output.png
│   ├── .env
│   └── package.json
│
├── ai-content-studio/         # 🚀 Full-stack blog + image generation
│   ├── server.js
│   ├── public/index.html
│   ├── .env
│   └── package.json
│
├── pinecone-rag-demo/         # 🌲 Pinecone vector DB CRUD operations
│   ├── index.js
│   ├── .env
│   └── package.json
│
├── ai-pdf-assistant/          # 📄 Upload, chunk, index & chat with PDFs
│   ├── server.js
│   ├── public/index.html
│   ├── uploads/
│   ├── .env
│   └── package.json
│
├── gemini-rag-project/        # 🧠 RAG with in-memory vectors (no external DB)
│   ├── server.js
│   ├── public/index.html
│   ├── uploads/
│   ├── .env
│   └── package.json
│
├── gemini-tool-calling/       # 🔧 AI Function Calling with tools
│   ├── server.js
│   ├── public/index.html
│   ├── .env
│   └── package.json
│
├── langchain-orchestrator/    # 🦜 LangChain Chains, Memory & Agents
│   ├── server.js
│   ├── public/index.html
│   ├── .env
│   └── package.json
│
├── langchain-pdf-assistant/   # 📄 LangChain + Pinecone RAG with citations
│   ├── server.js
│   ├── public/index.html
│   ├── uploads/
│   ├── .env
│   └── package.json
│
├── task-oriented-agent-lab/   # 🤖 Planning, memory, & tool autonomy
│   ├── server.js
│   ├── public/index.html
│   ├── .env
│   └── package.json
│
├── researcher-writer-agent-duo/ # 👥 LangGraph multi-agent collaboration
│   ├── server.js
│   ├── public/index.html
│   ├── .env
│   └── package.json
│
├── langgraph-react-loop/      # 🔁 LangGraph conditional routing agent loop
│   ├── server.js
│   ├── public/index.html
│   ├── .env
│   └── package.json
│
├── ai-software-engineer-agent/ # 💻 Autonomous developer & debugging loop
│   ├── server.js
│   ├── public/index.html
│   ├── .env
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Projects

### 1. 🟢 Hello AI Project

> **Your first Generative AI API call**

A minimal Node.js script that sends a prompt to the **Google Gemini** model and prints the response to the console. The perfect starting point.

- **Type:** CLI Script
- **Entry:** `index.js`
- **Model:** `gemini-3.1-flash-lite`
- **What it does:** Sends a welcome message prompt and prints the AI-generated response.

```bash
cd hello-ai-project
npm install
node index.js
```

---

### 2. 🎛️ Prompt Playground

> **Experiment with prompt engineering parameters**

A full-stack web app that lets you type custom prompts and tweak generation parameters like **temperature** and **max tokens** in real time to see how they affect AI output.

- **Type:** Web App (Express + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Model:** `gemini-3.1-flash-lite`
- **Key Features:**
  - Adjustable temperature (creativity control)
  - Configurable max output tokens
  - Interactive web UI

```bash
cd prompt-playground
npm install
node server.js
# Open http://localhost:3000
```

---

### 3. ⚡ Stream AI Response

> **Real-time token-by-token streaming**

Demonstrates how to stream AI responses from Gemini using **chunked transfer encoding**, so users see the text appear word-by-word instead of waiting for the full response.

- **Type:** Web App (Express + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Model:** `gemini-3.1-flash-lite`
- **Key Features:**
  - Server-side streaming via `generateContentStream()`
  - Chunked HTTP response headers
  - Real-time UI rendering

```bash
cd stream-ai-response
npm install
node server.js
# Open http://localhost:3000
```

---

### 4. 💬 AI Chatbot Project

> **Multi-turn conversational AI**

A chatbot web app that maintains **conversation history** across messages. Gemini remembers context from previous turns, enabling natural back-and-forth dialogue.

- **Type:** Web App (Express + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Model:** `gemini-3.1-flash-lite`
- **Key Features:**
  - Persistent chat history via `startChat()` API
  - Context-aware multi-turn conversations
  - Clean chat UI

```bash
cd ai-chatbot-project
npm install
node server.js
# Open http://localhost:3000
```

---

### 5. 👁️ Vision Applications

> **CLI-based image analysis with Gemini**

A command-line script that reads a local image file, converts it to base64, and sends it to Gemini's **multimodal vision model** for detailed analysis.

- **Type:** CLI Script
- **Entry:** `index.js`
- **Model:** `gemini-3.1-flash-lite`
- **What it does:** Analyzes `test-img.png` and prints a detailed description to the console.

```bash
cd vision-applications
npm install
node index.js
```

---

### 6. 🖼️ AI Vision Assistant

> **Web-based image upload and AI analysis**

A web application where users can **upload images** through a browser interface. The server processes the upload with **Multer**, sends it to Gemini's vision model, and returns a comprehensive analysis.

- **Type:** Web App (Express + Multer + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Model:** `gemini-3.1-flash-lite`
- **Key Features:**
  - Drag-and-drop / file picker image upload
  - Server-side image processing with Multer
  - Automatic temp file cleanup after analysis

```bash
cd ai-vision-assistant
npm install
node server.js
# Open http://localhost:3000
```

---

### 7. 🎨 Hugging Face Image Generator

> **Text-to-image generation with FLUX**

A CLI script that uses the **Hugging Face Inference API** with the `FLUX.1-schnell` model by Black Forest Labs to generate images from text prompts and save them locally.

- **Type:** CLI Script
- **Entry:** `index.js`
- **Model:** `black-forest-labs/FLUX.1-schnell` (via Hugging Face)
- **What it does:** Generates a futuristic cityscape image and saves it as `output.png`.

```bash
cd hugging-face-gen
npm install
node index.js
# Check output.png
```

---

### 8. 🚀 AI Content Studio

> **Full-stack AI blog & image generation pipeline**

The capstone project that combines **Google Gemini** for text generation and **Hugging Face** for image generation. Enter a topic and the app generates a complete marketing blog post with a title, body content, and a matching AI-generated image — all in one workflow.

- **Type:** Web App (Express + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Models:**
  - `gemini-3.1-flash-lite` — blog content generation (JSON mode)
  - `FLUX.1-schnell` — accompanying image generation
- **Key Features:**
  - Structured JSON output from Gemini
  - Multi-API orchestration (Gemini + Hugging Face)
  - Auto-generated image prompt from blog content
  - Complete blog post output (title + body + image)

```bash
cd ai-content-studio
npm install
node server.js
# Open http://localhost:3000
```

---

### 9. 🌲 Pinecone RAG Demo

> **Learn Pinecone vector database CRUD operations**

A CLI script that demonstrates how to use **Pinecone** as a vector database. It covers all essential operations — insert, search (similarity), fetch, update, and delete — using student records with 8-dimensional score vectors and metadata.

- **Type:** CLI Script
- **Entry:** `index.js`
- **Database:** Pinecone (vector DB)
- **Key Features:**
  - Connect to a Pinecone index
  - Upsert vectors with metadata (name, department)
  - Similarity search with `topK` results
  - Fetch records by ID
  - Update existing vectors
  - Delete records by ID

```bash
cd pinecone-rag-demo
npm install
node index.js
```

---

### 10. 📄 AI PDF Assistant (Mini Project)

> **Upload a PDF, chunk it, index it in Pinecone, and chat with it using RAG**

The capstone mini project that brings together **PDF parsing**, **Gemini embeddings**, **Pinecone vector search**, and **Gemini chat** into a complete RAG (Retrieval-Augmented Generation) pipeline. Upload any PDF and ask questions — the AI retrieves relevant chunks and generates accurate, context-aware answers.

- **Type:** Web App (Express + Multer + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Models:**
  - `text-embedding-004` — embedding generation for chunks & queries
  - `gemini-2.0-flash` — answer generation with retrieved context
- **Key Features:**
  - PDF upload with drag-and-drop
  - Automatic text extraction and chunking (~500 chars with overlap)
  - Vector embedding and Pinecone indexing
  - Semantic similarity search (top-3 retrieval)
  - RAG-powered multi-turn chat
  - Clear & reset functionality

**Pinecone Setup:**
Create an index with **512 dimensions** and **cosine** metric at [Pinecone Console](https://app.pinecone.io/).

```bash
cd ai-pdf-assistant
npm install
node server.js
# Open http://localhost:3000
```

---

### 11. 🧠 Gemini RAG Project

> **RAG pipeline using pure Gemini — no external database needed**

A lightweight RAG system that uses **Gemini embeddings** and an **in-memory vector store** with cosine similarity search. No Pinecone or any external database required — just a Gemini API key. Upload a PDF, and the app chunks it, embeds it, stores vectors in memory, and lets you chat with it.

- **Type:** Web App (Express + Multer + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Models:**
  - `text-embedding-004` — embedding generation (768 dimensions)
  - `gemini-2.0-flash` — answer generation with retrieved context
- **Key Features:**
  - PDF upload with drag-and-drop
  - In-memory vector store (no external DB setup)
  - Cosine similarity search
  - Source chunk citations with similarity scores
  - Multi-turn RAG chat
  - Zero configuration — just add your Gemini API key

```bash
cd gemini-rag-project
npm install
node server.js
# Open http://localhost:3000
```

---

### 12. 🔧 Gemini Tool Calling

> **AI Function Calling — LLM decides which tools to use**

Demonstrates **Gemini’s Function Calling** capability where the AI inspects tool schemas, decides which function to call based on the user’s natural language intent, generates structured arguments, and uses the returned results to produce a final response. Supports **parallel tool calling** (e.g., “Compare weather in Delhi and London” calls `getWeather` twice simultaneously).

- **Type:** Web App (Express + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Model:** `gemini-2.0-flash`
- **Available Tools:**
  - `getWeather(location)` — Get current weather for a city
  - `calculate(expression)` — Evaluate math expressions
  - `getCurrentTime(timezone)` — Get current time for a timezone
  - `searchProducts(query)` — Search a simulated product catalog
- **Key Features:**
  - Tool definition with JSON schemas
  - Automatic tool selection by the LLM
  - Parallel tool calling support
  - Tool call visualization in the chat UI (args + results)
  - Multi-turn conversation with tool context
  - Example prompts for easy testing

```bash
cd gemini-tool-calling
npm install
node server.js
# Open http://localhost:3000
```

---

### 13. 🦜 LangChain Orchestrator

> **Orchestrate LLM workflows with Chains (LCEL), Memory, and Tool-use Agents**

A complete educational dashboard project to learn the industry-standard orchestration framework **LangChain**. It includes interactive tabs demonstrating three core pillars:
1. **Chains (LCEL)** — A sequential chain that generates a business name based on user ideas, and automatically pipes the name to generate a matching tagline.
2. **Memory** — Chat interface displaying live JSON memory state updates showing how conversation history is injected dynamically on every turn.
3. **Agents & Tools** — A reasoning loop that determines when to trigger custom local tools (exchange rate, founder lookup) to answer multi-step prompts.

- **Type:** Web App (Express + LangChain + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Model:** `gemini-3.1-flash-lite`
- **Key Modules:**
  - `@langchain/core` (runnables, prompt templates, message classes)
  - `@langchain/google-genai` (Gemini chat integration)

```bash
cd langchain-orchestrator
npm install
node server.js
# Open http://localhost:3000
```

---

### 14. 📄 LangChain PDF Assistant (RAG)

> **Document Intelligence System with Recursive Splitting, Pinecone, and Citation Tracking**

A professional RAG (Retrieval-Augmented Generation) document intelligence web app built using **LangChain.js**. It parses uploaded PDFs, splits them recursively to preserve semantic context, generates vectors using GoogleGenAIEmbeddings, stores them in Pinecone, and tracks similarity search citations visually in the chat UI.

- **Type:** Web App (Express + Multer + LangChain + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Models:**
  - `gemini-embedding-2` (via LangChain's GoogleGenerativeAIEmbeddings)
  - `gemini-3.1-flash-lite` (via LangChain's ChatGoogleGenerativeAI)
- **Key Features:**
  - PDF parser with temporary file cleanup
  - **Recursive Character Text Splitting** to preserve context
  - Google GenAI embeddings indexed directly in Pinecone
  - Strict system prompt with source citation formatting constraints ([Source X])
  - Clickable citation side card panel linking search results to response badges
  - Multi-turn conversation state tracking

```bash
cd langchain-pdf-assistant
npm install
node server.js
# Open http://localhost:3000
```

---

### 15. 🤖 Task-Oriented Agent Lab

> **Autonomous planning, execution memory logs, and self-correction simulation**

Demonstrates key principles of **Agentic AI**: Autonomy, Planning, and Memory. The user enters a research goal (e.g., "Research the Pythagorean theorem and calculate the hypotenuse of a right triangle with sides 3 and 4"). The agent uses Gemini in structured JSON mode to build a step-by-step plan, executes it autonomously by dispatching inputs to the live Wikipedia REST API and calculation tools, maintains a running memory log of results, and generates a final report using previous memories.

- **Type:** Web App (Express + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Model:** `gemini-3.1-flash-lite` (in structured JSON mode)
- **Key Features:**
  - Dynamic JSON planning engine
  - Step-by-step execution visualization with live status checks
  - Working memory store (JSON memory logging)
  - Calculator and **live Wikipedia REST API search** tool dispatcher

```bash
cd task-oriented-agent-lab
npm install
node server.js
# Open http://localhost:3000
```

---

### 16. 👥 Researcher-Writer Agent Duo

> **Collaborative multi-agent workflows using LangGraph.js**

Showcases **Multi-Agent Collaboration** using stateful graphs. Using **LangGraph.js**, the application structures the workspace into a Directed Acyclic Graph containing nodes (Researcher and Writer agents) and edges. The shared annotated graph state passes topic details to the Researcher agent to fetch fact summaries, which are piped directly to the Writer agent to draft a formatted blog newsletter.

- **Type:** Web App (Express + LangGraph + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Model:** `gemini-3.1-flash-lite` (via LangChain's ChatGoogleGenerativeAI)
- **Key Features:**
  - Directed state graph structure (`__start__` -> `researcherNode` -> `writerNode` -> `__end__`)
  - Stateful shared memory (Annotated properties)
  - Dual side-by-side agent cards showing check-off states
  - Graph flow active node highlighting in the UI

```bash
cd researcher-writer-agent-duo
npm install
node server.js
# Open http://localhost:3000
```

---

### 17. 🔁 LangGraph ReAct Loop

> **Stateful reasoning loops with conditional edges and tool executions**

Illustrates the classic **ReAct** (Reasoning and Acting) execution pattern using **LangGraph.js**. The application constructs a cyclic state graph that processes user inputs inside an Agent node, evaluates if a tool call is needed, routes to an Action node via a conditional edge, executes the tool, and loops back to the Agent node recursively until a final text result is generated.

- **Type:** Web App (Express + LangGraph + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Model:** `gemini-3.1-flash-lite` (via LangChain's ChatGoogleGenerativeAI)
- **Key Features:**
  - Cyclic state graph loop (`__start__` -> `agentNode` -> conditional edge -> `actionNode` -> `agentNode`)
  - Shared message history state reducer (`(x, y) => x.concat(y)`)
  - Safe mathematical evaluation tool
  - Interactive loop transition highlighting in the UI

```bash
cd langgraph-react-loop
npm install
node server.js
# Open http://localhost:3000
```

---

### 18. 💻 AI Software Engineer Agent

> **Autonomous loop agent for code analysis, debugging, and unit testing**

Showcases an **Autonomous Developer Agent** that reads, edits, and debugs code. The agent operates in a cyclic loop to analyze errors, write modifications to a simulated workspace, run unit tests in an isolated context, and iterate until the test suite successfully passes, finally creating a structured bug fix report.

- **Type:** Web App (Express + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Model:** `gemini-3.1-flash-lite` (via GoogleGenerativeAI SDK)
- **Key Features:**
  - Autonomous developer loop with maximum step boundaries
  - Simulated workspace filesystem state
  - Real-time Node.js script compilation and unit test execution
  - Detailed bug report compiler tool
  - Multi-tab file viewer and interactive log terminal

```bash
cd ai-software-engineer-agent
npm install
node server.js
# Open http://localhost:3000
```

---

## 📋 Prerequisites

- [**Node.js**](https://nodejs.org/) v18 or higher
- [**npm**](https://www.npmjs.com/) (comes with Node.js)
- A [**Google AI Studio**](https://aistudio.google.com/apikey) API key (for Gemini projects)
- A [**Hugging Face**](https://huggingface.co/settings/tokens) access token (for image generation projects)
- A [**Pinecone**](https://app.pinecone.io/) API key (for vector database projects)

---

## ⚙️ Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/Soumojitshome2023/gen-n-agentic-ai.git
   cd "gen-n-agentic-ai"
   ```

2. **Navigate to any project**

   ```bash
   cd hello-ai-project
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Set up environment variables** (see [API Keys Setup](#-api-keys-setup))

5. **Run the project**

   ```bash
   # For CLI projects:
   node index.js

   # For web app projects:
   node server.js
   ```

---

## 🔑 API Keys Setup

Each project requires a `.env` file in its directory. Create one based on the project's needs:

### For Gemini projects (most projects)

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

Get your key at → [Google AI Studio](https://aistudio.google.com/apikey)

### For Hugging Face projects (`hugging-face-gen`)

```env
HF_TOKEN=your_hugging_face_token_here
```

Get your token at → [Hugging Face Settings](https://huggingface.co/settings/tokens)

### For combined projects (`ai-content-studio`)

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
HF_TOKEN=your_hugging_face_token_here
```

### For Pinecone projects (`pinecone-rag-demo`)

```env
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX=demo-index
```

### For RAG projects (`ai-pdf-assistant`)

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX=your_pinecone_index_name
```

Get your Pinecone key at → [Pinecone Console](https://app.pinecone.io/)

### For Gemini-only RAG (`gemini-rag-project`)

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

No external database keys needed — vectors are stored in memory.

### For LangChain projects (`langchain-orchestrator`)

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### For LangChain RAG projects (`langchain-pdf-assistant`)

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX=your_pinecone_index_name
```

### For LangGraph and Agent projects (`researcher-writer-agent-duo`, `langgraph-react-loop`, & `ai-software-engineer-agent`)

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

> ⚠️ **Important:** Never commit your `.env` files to version control. They are already listed in `.gitignore`.

---

## 🛠️ Tech Stack

| Technology                                                       | Purpose                              |
| ---------------------------------------------------------------- | ------------------------------------ |
| [Node.js](https://nodejs.org/)                                   | JavaScript runtime                   |
| [Express.js](https://expressjs.com/)                             | Web server framework                 |
| [Google Generative AI SDK](https://ai.google.dev/)               | Gemini API client                    |
| [Hugging Face Inference](https://huggingface.co/docs/inference)  | Image generation API client          |
| [Multer](https://github.com/expressjs/multer)                    | File upload middleware               |
| [Pinecone SDK](https://docs.pinecone.io/)                        | Vector database client               |
| [pdf-parse](https://www.npmjs.com/package/pdf-parse)             | PDF text extraction                  |
| [LangChain Core](https://js.langchain.com/)                       | Orchestration core interfaces        |
| [LangChain Google GenAI](https://js.langchain.com/)               | LangChain Gemini integration         |
| [LangChain Text Splitters](https://js.langchain.com/)             | Recursive text chunking utilities   |
| [LangGraph.js](https://js.langchain.com/)                        | Multi-agent graph state workflow    |
| [dotenv](https://github.com/motdotla/dotenv)                     | Environment variable management      |

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">

**Built with ❤️ for Engineers learning Generative AI**

⭐ Star this repo if you found it helpful!

</div>
