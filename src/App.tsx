import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

// Initialize the Gemini AI
const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Your specific Clerk Publishable Key
const PUBLISHABLE_KEY = "pk_live_Y2xlcmsucmVhZHlyZXBseWFpLmNvbSQ";

// 💰 Your Stripe Checkout Link
const STRIPE_LINK = "https://buy.stripe.com/6oU4gr6iR3QVaSe1Rg1B600";

export default function App() {
  const [companyKnowledge, setCompanyKnowledge] = useState('');
  const [brandVoice, setBrandVoice] = useState('');
  const [emailThread, setEmailThread] = useState('');
  const [goal, setGoal] = useState('Resolve Customer Issue');
  const [tone, setTone] = useState('Professional');
  const [generatedReply, setGeneratedReply] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {

    // --- PHASE 2: THE CASH REGISTER ---
    // For this test, we are pretending the user does not have an active subscription yet!
    // When you want to use the AI yourself, just change this false to true.
    const hasPaid = false;

    if (!hasPaid) {
      // If they haven't paid, send them straight to Stripe!
      window.location.href = STRIPE_LINK;
      return;
    }
    // -----------------------------------

    if (!emailThread) return alert("Please paste an email thread first!");
    setIsGenerating(true);
    setGeneratedReply('');
    try {
      const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `
        You are an elite, highly-paid communication and customer support assistant. 
        COMPANY KNOWLEDGE & POLICIES: ${companyKnowledge ? companyKnowledge : 'Use standard professional best practices.'}
        BRAND VOICE & WRITING STYLE: ${brandVoice ? brandVoice : 'Write in a clear, polite, and standard professional tone.'}
        TASK: Write a response to the following email thread. 
        Goal of the response: ${goal}
        Desired Tone: ${tone}
        CRITICAL INSTRUCTION: Analyze the email thread to find the customer's name. Always address them by their name in the greeting (e.g., "Hi [Name],"). If absolutely no name can be found, use a polite, professional greeting.
        EMAIL THREAD: ${emailThread}
        Draft the response email now. Provide ONLY the email text. Do not include any intro or outro commentary.
      `;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setGeneratedReply(response.text());
    } catch (error) {
      console.error(error);
      setGeneratedReply('Error generating reply. Please check your API key and connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <div className="min-h-screen bg-slate-50">

        {/* Navigation Bar */}
        <div className="flex justify-between items-center p-4 bg-white shadow-sm mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900">ReadyReply AI</h1>
          <SignedIn>
            <div className="flex items-center gap-4">
              {/* Upgrade Button in the header just in case! */}
              <a href={STRIPE_LINK} className="text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg">
                Upgrade to Pro
              </a>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>

        {/* Marketing Page (Logged Out) */}
        <SignedOut>
          <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
            <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
              Write Perfect Emails in <span className="text-blue-600">Seconds</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl">
              Stop wasting time on difficult emails. Our AI copilot learns your business rules and brand voice to draft the perfect response instantly.
            </p>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg text-lg transition-all">
                Start 7-Day Free Trial
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        {/* App Dashboard (Logged In) */}
        <SignedIn>
          <div className="max-w-3xl mx-auto space-y-8 px-4 pb-12">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">ReadyReply AI <span className="text-blue-600">Pro</span></h2>
              <p className="mt-2 text-slate-600">Welcome back! Let's clear out that inbox.</p>
            </div>

            <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-6 md:p-8 space-y-8">

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                  <span className="bg-blue-100 text-blue-700 text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center mr-3">1</span>
                  System Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Knowledge</label>
                    <textarea className="w-full border-slate-300 rounded-lg shadow-sm p-3 border focus:ring-blue-500" rows={3} value={companyKnowledge} onChange={(e) => setCompanyKnowledge(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Brand Voice</label>
                    <textarea className="w-full border-slate-300 rounded-lg shadow-sm p-3 border focus:ring-blue-500" rows={3} value={brandVoice} onChange={(e) => setBrandVoice(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                  <span className="bg-blue-100 text-blue-700 text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center mr-3">2</span>
                  Goal & Tone
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select className="w-full border-slate-300 rounded-lg shadow-sm p-3 border focus:ring-blue-500" value={goal} onChange={(e) => setGoal(e.target.value)}>
                    <option>Resolve Customer Issue</option><option>Politely Decline</option><option>Follow Up on Pitch</option>
                  </select>
                  <select className="w-full border-slate-300 rounded-lg shadow-sm p-3 border focus:ring-blue-500" value={tone} onChange={(e) => setTone(e.target.value)}>
                    <option>Professional</option><option>Friendly & Warm</option><option>Firm & Direct</option><option>Apologetic</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                  <span className="bg-blue-100 text-blue-700 text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center mr-3">3</span>
                  Context
                </h2>
                <textarea className="w-full border-slate-300 rounded-lg shadow-sm p-4 border focus:ring-blue-500" rows={5} placeholder="Paste the email chain here..." value={emailThread} onChange={(e) => setEmailThread(e.target.value)} />
              </div>

              <button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all disabled:opacity-50 text-lg flex items-center justify-center gap-2">
                🔒 Generate Perfect Reply
              </button>

              {generatedReply && (
                <div className="mt-8 space-y-4 border-t pt-8">
                  <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                    <span className="bg-green-100 text-green-700 text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center mr-3">✓</span>
                    Your Drafted Reply
                  </h2>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-slate-800 whitespace-pre-wrap">{generatedReply}</div>
                </div>
              )}
            </div>
          </div>
        </SignedIn>
        <SignedOut>
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Welcome to ReadyReply AI</h2>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl">
              Your elite AI communication assistant. Sign in to start drafting professional customer support replies in seconds.
            </p>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Sign In to Get Started
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        {/* Simple Footer */}
        <div className="text-center py-8 text-slate-500 text-sm">
          <p>© 2026 ReadyReply AI. All rights reserved. | <a href="/privacy.html" className="underline hover:text-slate-800">Privacy Policy</a></p>
        </div>
      </div>
    </ClerkProvider>
  );
}