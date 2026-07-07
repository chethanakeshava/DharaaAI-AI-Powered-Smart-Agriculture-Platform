import { RequestHandler } from 'express';

interface ChatRequest {
  message: string;
}

interface ChatResponse {
  reply: string;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

if (!GEMINI_API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY not configured. Chat endpoint will not work.');
}

export const handleChat: RequestHandler = async (req, res) => {
  try {
    const { message } = req.body as ChatRequest;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (!GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Chat service is not configured' });
    }

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ],
      systemInstruction: {
        parts: [
          {
            text: 'You are DharaaBot, a friendly and concise AI assistant for the DharaaAI website. You help farmers with crop advice, fertilizer recommendations, and agricultural insights. Keep answers short, polite, and practical. Focus on agricultural topics.',
          },
        ],
      },
    };

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Gemini API error: ${response.status}`, await response.text());
      return res.status(response.status).json({
        error: `Gemini API failed: ${response.status}`,
      });
    }

    const data = await response.json();
    const aiText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't process that. Please try again.";

    return res.json({ reply: aiText } as ChatResponse);
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};
