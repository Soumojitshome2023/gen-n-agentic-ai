import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
let chatHistory = [];

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
    const chat = model.startChat({ history: chatHistory });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // History is automatically updated within the chat object
    chatHistory = await chat.getHistory();

    res.json({ response: text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));