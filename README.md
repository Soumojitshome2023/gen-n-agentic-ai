# 🤖 Generative AI & Agentic AI for Engineers

A hands-on collection of **8 projects** that progressively teach you how to build real-world applications with **Google Gemini** and **Hugging Face** APIs — from your first API call to full-stack AI-powered web apps.

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

## 📋 Prerequisites

- [**Node.js**](https://nodejs.org/) v18 or higher
- [**npm**](https://www.npmjs.com/) (comes with Node.js)
- A [**Google AI Studio**](https://aistudio.google.com/apikey) API key (for Gemini projects)
- A [**Hugging Face**](https://huggingface.co/settings/tokens) access token (for image generation projects)

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
| [dotenv](https://github.com/motdotla/dotenv)                     | Environment variable management      |

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">

**Built with ❤️ for Engineers learning Generative AI**

⭐ Star this repo if you found it helpful!

</div>
