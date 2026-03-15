import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Request, Response } from "express";

export default async function handler(req: Request, res: Response) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle preflight CORS request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const { emailText } = req.body;

    if (!emailText) {
      return res.status(400).json({ success: false, error: "Missing emailText in request body" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables.");
      return res.status(500).json({ success: false, error: "Server misconfiguration: API key is missing." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use gemini-2.5-flash with system instruction
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "You are an elite customer support assistant. You must always address the customer by their name if provided within the text, and maintain a highly professional, helpful, and empathetic tone."
    });

    const prompt = `Please draft a professional, helpful, and empathetic response to the following customer message:\n\n${emailText}`;

    const result = await model.generateContent(prompt);
    const generatedText = result.response.text();

    return res.status(200).json({ success: true, text: generatedText });
  } catch (error) {
    console.error("Error generating AI response:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}
