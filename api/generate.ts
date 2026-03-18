import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClerkClient, verifyToken } from "@clerk/backend";
import type { Request, Response } from "express";

export default async function handler(req: Request, res: Response) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
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
    const authHeader = req.headers.authorization as string | undefined;
    const token = authHeader?.replace('Bearer ', '') || authHeader?.replace('bearer ', '');

    if (!token) {
      return res.status(401).json({ error: "Unauthorized. Please log in to readyreplyai.com to use the extension." });
    }

    let verifiedToken;
    try {
      verifiedToken = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });
    } catch (error) {
      // Add this console.error so we can see exactly why Clerk is mad!
      console.error("Clerk Token Verification Failed:", error);
      return res.status(401).json({ error: "Unauthorized. Please log in to readyreplyai.com to use the extension." });
    }

    const userId = verifiedToken.sub;
    
    // Retrieve the user from Clerk to check their Stripe subscription status
    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const user = await clerkClient.users.getUser(userId);

    const isAdmin = user.emailAddresses.some(email => email.emailAddress === "trustedessentialsgpt@gmail.com");

    if (!isAdmin && user.publicMetadata.stripeSubscriptionStatus !== 'active') {
      return res.status(403).json({ error: "Forbidden. Please upgrade to an active Stripe subscription to use this feature." });
    }

    // Extract dynamic prompt parameters with defaults
    const { emailText, tone, goal, companyKnowledge, brandVoice } = req.body;

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

    const promptTone = tone || "professional";
    const promptGoal = goal || "resolve the customer's issue";

    let prompt = `You are an elite, highly-paid communication and customer support assistant.\n`;
    
    if (companyKnowledge) {
      prompt += `COMPANY KNOWLEDGE & POLICIES: ${companyKnowledge}\n`;
    }
    
    if (brandVoice) {
      prompt += `BRAND VOICE & WRITING STYLE: ${brandVoice}\n`;
    }

    prompt += `TASK: Write a response to the following customer message.\nGoal of the response: ${promptGoal}\nDesired Tone: ${promptTone}\nCRITICAL INSTRUCTION: Analyze the email thread to find the customer's name. Always address them by their name in the greeting (e.g., "Hi [Name],"). If absolutely no name can be found, use a polite, professional greeting. Do not include any intro or outro commentary.\nCUSTOMER MESSAGE:\n\n${emailText}`;

    const result = await model.generateContent(prompt);
    const generatedText = result.response.text();

    return res.status(200).json({ success: true, text: generatedText });
  } catch (error) {
    console.error("Error generating AI response:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}
