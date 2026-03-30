import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateRawSlides(userPrompt, apiKey) {
  if (!apiKey) {
    throw new Error("API key is required. Please set it in the settings.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-pro-preview",
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
    }
  });

  // The system prompt ONLY cares about data structure.
  const systemInstruction = `
    You are a data formatting engine. 
    Read the user's prompt carefully and generate the requested slide content exactly as they ask.
    
    You MUST output valid JSON matching this exact schema:
    {
      "presentation_title": "string",
      "slides": [
        {
          "slide_title": "string",
          "content_lines":["string", "string"]
        }
      ]
    }
  `;

  // Combine them. The user dictates the rules.
  const prompt = `${systemInstruction}\n\nUSER PROMPT:\n${userPrompt}`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    // Quick sanitize in case of weird characters or markdown blocks
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    return JSON.parse(text);
  } catch (error) {
    console.error("=== GEMINI API RAW ERROR ===");
    console.dir(error);
    console.error("Message:", error.message);
    if (error.stack) console.error("Stack:", error.stack);

    if (error.message && error.message.includes("Failed to fetch")) {
      console.error("\n[DIAGNOSTICS] The request didn't even reach Google's servers. The browser or environment forcefully aborted it.");
      console.error("Common culprits:");
      console.error("1. A browser extension like an ad-blocker or a custom Dev extension is intercepting 'fetch'. (Notice 'requests.js' or 'initInterceptor' in your stack trace).");
      console.error("2. CORS / Corporate firewall blocking 'generativelanguage.googleapis.com'.");
      console.error("=> Please open this page in a Clean/Incognito window with all extensions disabled to confirm!\n");
    }
    throw error;
  }
}
