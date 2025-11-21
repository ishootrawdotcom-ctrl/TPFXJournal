import { GoogleGenAI } from "@google/genai";
import { Trade } from "../types";

// Safely initialize the AI client
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeTradingPerformance = async (trades: Trade[], monthStr: string): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please configure your environment variables.";
  }

  if (trades.length === 0) {
    return "No trades found for this period to analyze.";
  }

  // Prepare a summary of trades for the prompt
  const tradeSummary = trades.map(t => 
    `- ${t.type} ${t.ticker}: ${t.status === 'CLOSED' ? `P&L $${t.pnl?.toFixed(2)}` : 'OPEN'}. Setup: ${t.setup || 'N/A'}. Notes: ${t.notes || 'None'}`
  ).join('\n');

  const prompt = `
    You are an expert trading psychologist and risk manager.
    Analyze the following trading journal entries for the month of ${monthStr}.
    
    Trades:
    ${tradeSummary}

    Please provide:
    1. A brief summary of performance.
    2. Identify any potential behavioral patterns (e.g., revenge trading, overtrading, good discipline).
    3. Three actionable tips for the next month.

    Keep the tone professional, encouraging, but direct. Format with Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Error analyzing trades:", error);
    return "An error occurred while connecting to the AI service.";
  }
};