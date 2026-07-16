# 🤖 Generative AI & Agentic AI for Engineers

A hands-on collection of **21 projects** that progressively teach you how to build real-world applications with **Google Gemini**, **Hugging Face**, **Pinecone**, **LangChain**, and **LangGraph** — from your first API call to full-stack AI-powered web apps.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Repository Structure](#-repository-structure)
- [Projects](#-projects)
  - [1. Hello AI Project](#1--hello-ai-project)
  - [2. Prompt Playground](#2--prompt-playground)
  - [3. AI Chatbot Project](#3--ai-chatbot-project)
  - [4. Stream AI Response](#4--stream-ai-response)
  - [5. Vision Applications](#5--vision-applications)
  - [6. AI Vision Assistant](#6--ai-vision-assistant)
  - [7. Hugging Face Image Generator](#7--hugging-face-image-generator)
  - [8. AI Content Studio](#8--ai-content-studio)
  - [9. Pinecone RAG Demo](#9--pinecone-rag-demo)
  - [10. Gemini RAG Project](#10--gemini-rag-project)
  - [11. AI PDF Assistant (Mini Project)](#11--ai-pdf-assistant-mini-project)
  - [12. Gemini Tool Calling](#12--gemini-tool-calling)
  - [13. LangChain Orchestrator](#13--langchain-orchestrator)
  - [14. LangChain PDF Assistant](#14--langchain-pdf-assistant)
  - [15. Task-Oriented Agent Lab](#15--task-oriented-agent-lab)
  - [16. LangGraph ReAct Loop](#16--langgraph-react-loop)
  - [17. Researcher-Writer Agent Duo](#17--researcher-writer-agent-duo)
  - [18. Multimodal Instagram Post Creator Agent](#18--multimodal-instagram-post-creator-agent)
  - [19. AI Software Engineer Agent](#19--ai-software-engineer-agent)
  - [20. AI Email Writing Agent](#20--ai-email-writing-agent)
  - [21. AI Skincare Assistant & Routine Planner](#21-ai-skincare-assistant--routine-planner)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [API Keys Setup](#-api-keys-setup)
- [Tech Stack](#-tech-stack)
- [License](#-license)

---

## 🌟 Overview

This repository is structured as a **learning path** for engineers who want to master Generative AI integration. Each project builds upon the concepts of the previous one, covering:

| # | Concept | Project |
|---|---------|---------|
| 1 | Basic API Integration | Hello AI Project |
| 2 | Prompt Engineering | Prompt Playground |
| 3 | Multi-turn Conversations | AI Chatbot Project |
| 4 | Streaming Responses | Stream AI Response |
| 5 | Vision / Multimodal AI (CLI) | Vision Applications |
| 6 | Vision / Multimodal AI (Web) | AI Vision Assistant |
| 7 | Image Generation | Hugging Face Image Generator |
| 8 | Multi-API Orchestration | AI Content Studio |
| 9 | Vector Database (CRUD) | Pinecone RAG Demo |
| 10 | RAG (No External DB) | Gemini RAG Project |
| 11 | RAG / PDF Q&A with Pinecone | AI PDF Assistant |
| 12 | Tool / Function Calling | Gemini Tool Calling |
| 13 | LLM Orchestration (Chains) | LangChain Orchestrator |
| 14 | RAG with LangChain & Citations | LangChain PDF Assistant |
| 15 | Agentic AI (Planning & Memory) | Task-Oriented Agent Lab |
| 16 | Cyclic Agent Loops (ReAct) | LangGraph ReAct Loop |
| 17 | Multi-Agent Collaboration | Researcher-Writer Agent Duo |
| 18 | Creative Multi-Agent Flow | Multimodal Instagram Post Creator Agent |
| 19 | Autonomous Coding Agent | AI Software Engineer Agent |
| 20 | Agent Handoff & Knowledge Base | AI Email Writing Agent |
| 21 | Multimodal Diagnosis & Safety Audit | AI Skincare Assistant & Routine Planner |

---

## 📁 Repository Structure

```
Generative AI & Agentic AI for Engineers/
├── hello-ai-project/              # 🟢 Project 1  — Your first Gemini API call
│   ├── index.js
│   ├── .env
│   └── package.json
│
├── prompt-playground/             # 🎛️  Project 2  — Prompt, temperature & token experiments
│   ├── server.js
│   ├── public/
│   │   └── index.html
│   ├── .env
│   └── package.json
│
├── ai-chatbot-project/            # 💬 Project 3  — Multi-turn conversational chatbot
│   ├── server.js
│   ├── public/
│   │   └── index.html
│   ├── .env
│   └── package.json
│
├── stream-ai-response/            # ⚡ Project 4  — Real-time streaming AI responses
│   ├── server.js
│   ├── public/
│   │   └── index.html
│   ├── .env
│   └── package.json
│
├── vision-applications/           # 👁️  Project 5  — CLI-based image analysis
│   ├── index.js
│   ├── test-img.png
│   ├── .env
│   └── package.json
│
├── ai-vision-assistant/           # 🖼️  Project 6  — Web-based image upload & analysis
│   ├── server.js
│   ├── public/
│   │   └── index.html
│   ├── uploads/
│   ├── .env
│   └── package.json
│
├── hugging-face-gen/              # 🎨 Project 7  — Text-to-image with FLUX
│   ├── index.js
│   ├── output.png
│   ├── .env
│   └── package.json
│
├── ai-content-studio/             # 🚀 Project 8  — Full-stack blog + image generation
│   ├── server.js
│   ├── public/
│   │   └── index.html
│   ├── .env
│   └── package.json
│
├── pinecone-rag-demo/             # 🌲 Project 9  — Pinecone vector DB CRUD operations
│   ├── index.js
│   ├── .env
│   └── package.json
│
├── gemini-rag-project/            # 🧠 Project 10 — RAG with in-memory vectors (no external DB)
│   ├── server.js
│   ├── public/
│   │   └── index.html
│   ├── uploads/
│   ├── .env
│   └── package.json
│
├── ai-pdf-assistant/              # 📄 Project 11 — Upload, chunk, index & chat with PDFs
│   ├── server.js
│   ├── public/
│   │   └── index.html
│   ├── uploads/
│   ├── .env
│   └── package.json
│
├── gemini-tool-calling/           # 🔧 Project 12 — AI Function Calling with tools
│   ├── server.js
│   ├── public/
│   │   └── index.html
│   ├── .env
│   └── package.json
│
├── langchain-orchestrator/        # 🦜 Project 13 — LangChain Chains, Memory & Agents
│   ├── server.js
│   ├── public/
│   │   └── index.html
│   ├── .env
│   └── package.json
│
├── langchain-pdf-assistant/       # 📄 Project 14 — LangChain + Pinecone RAG with citations
│   ├── server.js
│   ├── public/
│   │   └── index.html
│   ├── uploads/
│   ├── .env
│   └── package.json
│
├── task-oriented-agent-lab/       # 🤖 Project 15 — Planning, memory & tool autonomy
│   ├── server.js
│   ├── public/
│   │   └── index.html
│   ├── .env
│   └── package.json
│
├── langgraph-react-loop/          # 🔁 Project 16 — LangGraph conditional routing agent loop
│   ├── server.js
│   ├── public/
│   │   └── index.html
│   ├── .env
│   └── package.json
│
├── researcher-writer-agent-duo/   # 👥 Project 17 — LangGraph multi-agent collaboration
│   ├── server.js
│   ├── public/
│   │   └── index.html
│   ├── .env
│   └── package.json
│
├── instagram-caption-agent/       # 📸 Project 18 — Multimodal Instagram Post Creator Agent
│   ├── server.js
│   ├── public/
│   │   ├── index.html
│   │   └── style.css
│   ├── uploads/
│   ├── .env
│   └── package.json
│
├── ai-software-engineer-agent/    # 💻 Project 19 — Multi-agent code analysis & review
│   ├── server.js
│   ├── public/
│   │   ├── index.html
│   │   └── style.css
│   ├── .env
│   └── package.json
│
├── ai-email-writing-agent/        # 📧 Project 20 — AI Email Writing Agent with agent handoff
│   ├── server.js
│   ├── public/
│   │   └── index.html
│   ├── data.txt
│   ├── .env
│   └── package.json
│
├── ai-skincare-agent/             # 🧴 Project 21 — AI Skincare Assistant and Routine Planner
│   ├── server.js
│   ├── public/
│   │   ├── index.html
│   │   └── style.css
│   ├── data.json
│   ├── .env
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Projects

---

### 1. 🟢 Hello AI Project

> **Your very first Gemini API call**

A minimal CLI script that sends a prompt to the **Gemini API** and prints the response to the terminal. The perfect starting point to verify your API key and understand the basic request/response cycle.

- **Type:** CLI Script
- **Entry:** `node index.js`
- **Model:** `gemini-3.1-flash-lite`
- **Key Features:**
  - Single API call to Gemini
  - Prints response to console
  - Minimal setup — just an API key

```bash
cd hello-ai-project
npm install
node index.js
```

---

### 2. 🎛️ Prompt Playground

> **Experiment with prompts, temperature & tokens interactively**

A web app that lets you send custom prompts to Gemini while controlling **temperature** and **max output tokens** via sliders. Understand how these parameters affect the style, length, and creativity of responses.

- **Type:** Web App (Express + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Model:** `gemini-3.1-flash-lite`
- **Key Features:**
  - Configurable temperature (0.0 – 1.0)
  - Configurable max output tokens
  - Real-time response display

```bash
cd prompt-playground
npm install
node server.js
# Open http://localhost:3000
```

---

### 3. 💬 AI Chatbot Project

> **Multi-turn conversational AI**

A chatbot web app that maintains **conversation history** across messages. Gemini remembers context from previous turns, enabling natural back-and-forth dialogue.

- **Type:** Web App (Express + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Model:** `gemini-3.1-flash-lite`
- **Key Features:**
  - Persistent chat history via `startChat()` API
  - Context-aware multi-turn conversations
  - Clean chat UI with message bubbles

```bash
cd ai-chatbot-project
npm install
node server.js
# Open http://localhost:3000
```

---

### 4. ⚡ Stream AI Response

> **Real-time token-by-token streaming**

Demonstrates how to stream AI responses from Gemini using **chunked transfer encoding**, so users see the text appear word-by-word instead of waiting for the full response.

- **Type:** Web App (Express + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Model:** `gemini-3.1-flash-lite`
- **Key Features:**
  - Server-side streaming via `generateContentStream()`
  - Chunked HTTP response headers
  - Real-time UI rendering as tokens arrive

```bash
cd stream-ai-response
npm install
node server.js
# Open http://localhost:3000
```

---

### 5. 👁️ Vision Applications

> **CLI-based image analysis with Gemini**

A command-line script that reads a local image file, converts it to base64, and sends it to Gemini's **multimodal vision model** for detailed analysis and description.

- **Type:** CLI Script
- **Entry:** `node index.js`
- **Model:** `gemini-3.1-flash-lite`
- **Key Features:**
  - Local image file reading with `fs`
  - Base64 inline data conversion
  - Multimodal prompt with image + text

```bash
cd vision-applications
npm install
node index.js
```

---

### 6. 🖼️ AI Vision Assistant

> **Web-based image upload & analysis**

A web app where users can **upload an image** directly from the browser. The backend receives it via Multer, converts it, and sends it to Gemini for a detailed analysis response displayed in the UI.

- **Type:** Web App (Express + Multer + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Model:** `gemini-3.1-flash-lite`
- **Key Features:**
  - File upload with Multer middleware
  - Image-to-base64 server-side conversion
  - Multimodal vision analysis result in browser

```bash
cd ai-vision-assistant
npm install
node server.js
# Open http://localhost:3000
```

---

### 7. 🎨 Hugging Face Image Generator

> **Text-to-image generation with FLUX**

A CLI script that takes a text prompt and generates a high-quality image using Hugging Face's **FLUX.1-schnell** model, saving the output as a PNG file.

- **Type:** CLI Script
- **Entry:** `node index.js`
- **Model:** `black-forest-labs/FLUX.1-schnell` (Hugging Face Inference)
- **Key Features:**
  - Text-to-image via Hugging Face Inference API
  - Saves output as `output.png`
  - Requires `HF_TOKEN`

```bash
cd hugging-face-gen
npm install
node index.js
```

---

### 8. 🚀 AI Content Studio

> **Full-stack blog post and image generation**

Combines **two AI APIs** — Google Gemini for writing blog posts and Hugging Face FLUX for generating matching cover images — into a single content generation pipeline.

- **Type:** Web App (Express + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Models:** `gemini-3.1-flash-lite` + `FLUX.1-schnell`
- **Key Features:**
  - Text content generation with Gemini
  - Image generation with Hugging Face FLUX
  - Unified pipeline in a single app
  - Requires both `GEMINI_API_KEY` and `HF_TOKEN`

```bash
cd ai-content-studio
npm install
node server.js
# Open http://localhost:3000
```

---

### 9. 🌲 Pinecone RAG Demo

> **Hands-on Pinecone vector database CRUD operations**

A CLI script demonstrating full **Pinecone vector database operations** — upsert, query, update, and delete. Ideal for understanding how vector databases store and retrieve semantic data before building a full RAG system.

- **Type:** CLI Script
- **Entry:** `node index.js`
- **Key Features:**
  - Pinecone index connection and namespace management
  - Upsert vectors with metadata
  - Semantic similarity query (top-K)
  - Update and delete vector records
  - Requires `PINECONE_API_KEY` and `PINECONE_INDEX`

```bash
cd pinecone-rag-demo
npm install
node index.js
```

---

### 10. 🧠 Gemini RAG Project

> **RAG pipeline using pure Gemini — no external database needed**

A lightweight RAG system using **Gemini embeddings** and an **in-memory vector store** with cosine similarity search. No Pinecone required — just a Gemini API key. Upload a PDF and the app chunks, embeds, and stores vectors in memory for multi-turn Q&A.

- **Type:** Web App (Express + Multer + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Models:** `text-embedding-004` + `gemini-2.0-flash`
- **Key Features:**
  - PDF upload with drag-and-drop
  - In-memory vector store (no external DB setup)
  - Cosine similarity search
  - Source chunk citations with similarity scores
  - Multi-turn RAG chat
  - Zero config — just a Gemini API key

```bash
cd gemini-rag-project
npm install
node server.js
# Open http://localhost:3000
```

---

### 11. 📄 AI PDF Assistant (Mini Project)

> **Upload a PDF, chunk it, index it in Pinecone, and chat with it using RAG**

The capstone mini project bringing together **PDF parsing**, **Gemini embeddings**, **Pinecone vector search**, and **Gemini chat** into a complete RAG pipeline. Upload any PDF and ask questions — the AI retrieves relevant chunks and generates accurate, context-aware answers.

- **Type:** Web App (Express + Multer + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Models:** `text-embedding-004` + `gemini-2.0-flash`
- **Key Features:**
  - PDF upload with drag-and-drop
  - Automatic text extraction and chunking (~500 chars with overlap)
  - Vector embedding and Pinecone indexing
  - Semantic similarity search (top-3 retrieval)
  - RAG-powered multi-turn chat
  - Clear & reset functionality

**Pinecone Setup:** Create an index with **512 dimensions** and **cosine** metric at [Pinecone Console](https://app.pinecone.io/).

```bash
cd ai-pdf-assistant
npm install
node server.js
# Open http://localhost:3000
```

---

### 12. 🔧 Gemini Tool Calling

> **AI Function Calling — LLM decides which tools to use**

Demonstrates Gemini's **function calling** feature where the LLM automatically selects and invokes the correct tool based on a natural language request, uses the result, and forms a final natural language response.

- **Type:** Web App (Express + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Model:** `gemini-3.1-flash-lite`
- **Key Features:**
  - Tool definition with JSON schema
  - Automatic tool selection by LLM
  - Weather, calculator, and search tool examples
  - Full request → tool call → result → final answer loop

```bash
cd gemini-tool-calling
npm install
node server.js
# Open http://localhost:3000
```

---

### 13. 🦜 LangChain Orchestrator

> **LangChain Chains, Memory & Agents demo**

Introduces **LangChain** as an orchestration framework. Demonstrates three core concepts: sequential **Chains**, persistent **Memory**, and dynamic **Agents** that pick tools at runtime.

- **Type:** Web App (Express + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Model:** `gemini-3.1-flash-lite` (via LangChain Google GenAI)
- **Key Features:**
  - Sequential prompt chaining with `RunnableSequence`
  - Conversational memory with `ChatMessageHistory`
  - Dynamic agent with tool selection
  - Three tabbed UI modes: Chain / Memory / Agent

```bash
cd langchain-orchestrator
npm install
node server.js
# Open http://localhost:3000
```

---

### 14. 📄 LangChain PDF Assistant

> **LangChain + Pinecone RAG pipeline with source citations**

A full RAG application built with **LangChain** abstractions — `RecursiveCharacterTextSplitter`, `GoogleGenerativeAIEmbeddings`, and Pinecone. Answers PDF questions with inline source citations like `[Source 1]`.

- **Type:** Web App (Express + Multer + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Models:** `text-embedding-004` + `gemini-2.0-flash`
- **Key Features:**
  - LangChain `RecursiveCharacterTextSplitter` for smart chunking
  - `GoogleGenerativeAIEmbeddings` for vector generation
  - Pinecone vector indexing & semantic search
  - Inline source citations with chunk metadata
  - Multi-turn RAG chat

```bash
cd langchain-pdf-assistant
npm install
node server.js
# Open http://localhost:3000
```

---

### 15. 🤖 Task-Oriented Agent Lab

> **Agentic AI: Autonomy, Planning & Memory**

Introduces **Agentic AI** — AI that acts with independence. The agent accepts a high-level goal, decomposes it into a step-by-step plan, executes each step using tools, stores results in memory, and uses past outputs to inform future steps.

- **Type:** Web App (Express + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Model:** `gemini-3.1-flash-lite`
- **Key Features:**
  - Goal decomposition into structured task plans
  - Tool selection per step (search, calculate, write, etc.)
  - Rolling memory context passed to each step
  - Step-by-step execution trace in UI
  - Autonomous decision loop

```bash
cd task-oriented-agent-lab
npm install
node server.js
# Open http://localhost:3000
```

---

### 16. 🔁 LangGraph ReAct Loop

> **LangGraph conditional routing agent loop**

Implements a **ReAct (Reasoning + Acting)** agent loop using LangGraph's conditional edge routing. The agent alternates between Thinking, Tool Calling, and Observing in a cyclic loop until it arrives at a final answer.

- **Type:** Web App (Express + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Model:** `gemini-3.1-flash-lite`
- **Graph Flow:** `[Start] → Agent Node → (tool call?) → Tool Node → Agent Node → ... → [End]`
- **Key Features:**
  - Conditional edges routing between agent and tool nodes
  - Real-time loop trace displayed per iteration
  - Tool set: web search simulation, calculator, date lookup
  - Safe mathematical evaluation tool
  - Interactive loop transition highlighting in UI

```bash
cd langgraph-react-loop
npm install
node server.js
# Open http://localhost:3000
```

---

### 17. 👥 Researcher-Writer Agent Duo

> **Multi-agent collaboration with LangGraph.js**

A **Multi-Agent System** built with LangGraph.js where two specialized agents collaborate: a **Researcher Agent** gathers and summarizes information on a topic, then a **Writer Agent** transforms that research into a polished article.

- **Type:** Web App (Express + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Model:** `gemini-3.1-flash-lite` (via LangChain)
- **Graph Flow:** `[Start] → Researcher Node → Writer Node → [End]`
- **Key Features:**
  - LangGraph stateful graph with shared state channels
  - Specialized agent roles (Researcher / Writer)
  - Step-by-step agent progress visualized in UI
  - Research summary + final article output tabs

```bash
cd researcher-writer-agent-duo
npm install
node server.js
# Open http://localhost:3000
```

---

### 18. 📸 Multimodal Instagram Post Creator Agent

> **Multimodal multi-agent Instagram caption, hashtag & visual planner**

A creative **Multi-Agent Workflow** built with LangGraph.js. Upload one or more images and select a tone — a **Vision Analyst** automatically describes the photo content, then a **Caption Writer**, **Hashtag Strategist**, **Visual Planner**, and **QA Verifier** collaborate to produce captions, categorized hashtags, a visual concept prompt, and an engagement score.

- **Type:** Web App (Express + Multer + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Model:** `gemini-3.1-flash-lite` (via LangChain Google GenAI)
- **Graph Flow:** `Analyst → Writer → Strategist → Planner → Verifier`
- **Key Features:**
  - Image upload (single or multiple) with thumbnail preview
  - Vision Analyst auto-extracts post context from images
  - Tone selector (Professional / Casual / Inspirational / Humorous / Promotional)
  - 3 caption styles: Hook-Based, Narrative/Emotive, Short & Punchy
  - Hashtags segmented: Broad, Niche, Custom — with per-group copy buttons
  - Visual scene concept prompt
  - QA engagement score gauge (1–10) with improvement tips
  - Fully responsive Instagram-themed UI

```bash
cd instagram-caption-agent
npm install
node server.js
# Open http://localhost:3000
```

---

### 19. 💻 AI Software Engineer Agent

> **Multi-agent code analysis, auditing & correction**

A collaborative multi-agent workflow built with **LangGraph.js** where specialized agents work in sequence. An **Analyzer**, **Auditor**, and **Optimizer** each review submitted code, and a final **QA Verifier** synthesizes findings into a complete report and corrected version.

- **Type:** Web App (Express + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Model:** `gemini-3.1-flash-lite` (via LangChain)
- **Key Features:**
  - LangGraph pipeline: Analyzer → Auditor → Optimizer → QA Verifier
  - Paste any language code for analysis
  - Agent step trace visualized live in UI
  - Final corrected code editor output
  - Detailed modification report generation

```bash
cd ai-software-engineer-agent
npm install
node server.js
# Open http://localhost:3000
```

---

### 20. 📧 AI Email Writing Agent

> **Dual-agent system with handoff — Main Agent routes email tasks to a specialist Email Writing Agent**

Demonstrates an **Agent Handoff Pattern** where a general-purpose **Main Agent** handles normal queries but automatically detects email-related requests and transfers control to a specialized **Email Writing Agent**. The Email Agent uses a file-based **Knowledge Base** (`data.txt`) to draft professional, personalized emails, supports iterative editing, and finalizes on user approval.

- **Type:** Web App (Express + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3000`
- **Model:** `gemini-3.1-flash-lite`
- **Key Features:**
  - Two-agent architecture: Main Agent + Email Writing Agent
  - Automatic agent handoff detection (no manual switching)
  - File-based Knowledge Base (`data.txt`) editable from the UI
  - Iterative email drafting loop — refine until satisfied
  - Approval state management (approve/reject draft)
  - Chat history tracking per agent
  - Session reset support

```bash
cd ai-email-writing-agent
npm install
node server.js
# Open http://localhost:3000
```

---

### 21. 🧴 AI Skincare Assistant & Routine Planner

> **Multi-agent skincare routine planner with multimodal photo analysis and ingredient safety verifier**

An agentic dashboard designed for daily skin-health management. The app accepts a user's skin profile and optional photo uploads (facial concerns or product active-ingredient labels). A **Vision Analyst** evaluates the image, a **Routine Planner** drafts custom AM/PM steps based on budget and skin goals, and a **Safety Verifier** cross-references active ingredients to flag harmful combinations, saving the entire state to a persistent global context file (`data.json`).

- **Type:** Web App (Express + Multer + HTML frontend)
- **Entry:** `server.js` → `http://localhost:3001`
- **Model:** `gemini-1.5-flash`
- **Key Features:**
  - File-based persistence (`data.json`) for daily tracking
  - Multimodal Vision Analysis (Face concerns & Product ingredient label scanning)
  - LangGraph multi-agent flow (Profiler → Analyst → Planner → Verifier)
  - Visual compatibility score meter & dermatological safety tips
  - Serene pastel-beige aesthetic dashboard with real-time agent trace logs

```bash
cd ai-skincare-agent
npm install
node server.js
# Open http://localhost:3001
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
   cd "Generative AI & Agentic AI for Engineers"
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
   # Then open http://localhost:3000
   ```

---

## 🔑 API Keys Setup

Each project requires a `.env` file in its directory. Create one based on the project's needs:

### Gemini only — Projects 1–6, 10, 12–19

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

Get your key at → [Google AI Studio](https://aistudio.google.com/apikey)

### Hugging Face only — Project 7

```env
HF_TOKEN=your_hugging_face_token_here
```

Get your token at → [Hugging Face Settings](https://huggingface.co/settings/tokens)

### Gemini + Hugging Face — Project 8 (AI Content Studio)

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
HF_TOKEN=your_hugging_face_token_here
```

### Pinecone only — Project 9 (Pinecone RAG Demo)

```env
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX=your_index_name
```

Get your key at → [Pinecone Console](https://app.pinecone.io/)

### Gemini + Pinecone — Projects 11, 14 (PDF Assistants)

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX=your_index_name
```

> ⚠️ **Important:** Never commit your `.env` files to version control. They are already listed in `.gitignore`.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| [Node.js](https://nodejs.org/) | JavaScript runtime |
| [Express.js](https://expressjs.com/) | Web server framework |
| [Google Generative AI SDK](https://ai.google.dev/) | Gemini API client (native) |
| [LangChain Google GenAI](https://js.langchain.com/) | Gemini via LangChain integration |
| [LangChain Core](https://js.langchain.com/) | Chains, prompts, output parsers |
| [LangChain Text Splitters](https://js.langchain.com/) | Recursive text chunking |
| [LangGraph.js](https://js.langchain.com/) | Multi-agent state graph workflows |
| [Hugging Face Inference](https://huggingface.co/docs/inference) | Image generation API client |
| [Pinecone SDK](https://docs.pinecone.io/) | Vector database client |
| [Multer](https://github.com/expressjs/multer) | File upload middleware |
| [pdf-parse](https://www.npmjs.com/package/pdf-parse) | PDF text extraction |
| [dotenv](https://github.com/motdotla/dotenv) | Environment variable management |

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">

**Built with ❤️ for Engineers learning Generative AI**

⭐ Star this repo if you found it helpful!

</div>
