// ============================================================================
// 🤖 Project 7: Hugging Face Image Generator
// ============================================================================

import { HfInference } from "@huggingface/inference";
import "dotenv/config";
import fs from "fs";

// ==========================================
// ⚙️ Configuration Settings
// ==========================================
const CONFIG = {
  MODEL_NAME: "black-forest-labs/FLUX.1-schnell",
};

const hf = new HfInference(process.env.HF_TOKEN);

async function generateImage() {
  const result = await hf.textToImage({
    model: CONFIG.MODEL_NAME,
    provider: "hf-inference",	
    inputs: 'A futuristic cityscape at sunset, highly detailed, 4k',
  });

  fs.writeFileSync('output.png', Buffer.from(await result.arrayBuffer()));
  console.log("Image saved as output.png");
}

generateImage();