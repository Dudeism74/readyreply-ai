import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ClerkProvider } from '@clerk/chrome-extension';
import { Show, SignInButton, UserButton } from '@clerk/react';

const PUBLISHABLE_KEY = "pk_live_Y2xlcmsucmVhZHlyZXBseWFpLmNvbSQ";
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
    const hasPaid = true;
    if (!hasPaid) {
      window.location.href = STRIPE_LINK;
      return;
    }

    if (!emailThread) return alert("Please paste an email thread first!");
    setIsGenerating(true);
    setGeneratedReply('');

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'undefined') {
        setGeneratedReply('Error: GEMINI_API_KEY is missing. Add it to your hosting environment variables.');
        setIsGenerating(false);
        return;
      }

      const ai = new GoogleGenerativeAI(apiKey);
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
      <div className="bg-slate-50 w-full md:w-[400px] min-h-[550px] mx-auto flex flex-col shadow-xl">

        <div className="flex justify-between items-center p-4 bg-white shadow-sm mb-4">
          <h1 className="text-xl font-extrabold text-slate-900">ReadyReply AI</h1>
          <div className="flex items-center gap-4">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                  Sign In
                </button>
              </SignInButton>
            </Show>

            <Show when="signed-in">
              <a href={STRIPE_LINK} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg">
                Upgrade
              </a>
              <UserButton afterSignOutUrl="/" />
            </Show>
          </div>
        </div>

        <Show when="signed-out">
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center flex-grow">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Write Perfect Emails in <span className="text-blue-600">Seconds</span>
            </h1>
            <p className="text-sm text-slate-600 mb-6">
              Stop wasting time on difficult emails. Our AI copilot learns your business rules and brand voice to draft the perfect response instantly.
            </p>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg text-md transition-all">
                Start 7-Day Free Trial
              </button>
            </SignInButton>
          </div>
        </Show>

        <Show when="signed-in">
          <div className="px-4 pb-6 space-y-6 flex-grow">
            <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-4 space-y-4">

              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700">Company Knowledge</label>
                <textarea className="w-full border-slate-300 rounded-lg shadow-sm p-2 border focus:ring-blue-500 text-sm" rows={2} value={companyKnowledge} onChange={(e) => setCompanyKnowledge(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700">Brand Voice</label>
                <textarea className="w-full border-slate-300 rounded-lg shadow-sm p-2 border focus:ring-blue-500 text-sm" rows={2} value={brandVoice} onChange={(e) => setBrandVoice(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select className="w-full border-slate-300 rounded-lg shadow-sm p-2 border focus:ring-blue-500 text-sm" value={goal} onChange={(e) => setGoal(e.target.value)}>
                  <option>Resolve Customer Issue</option><option>Politely Decline</option><option>Follow Up on Pitch</option>
                </select>
                <select className="w-full border-slate-300 rounded-lg shadow-sm p-2 border focus:ring-blue-500 text-sm" value={tone} onChange={(e) => setTone(e.target.value)}>
                  <option>Professional</option><option>Friendly & Warm</option><option>Firm & Direct</option><option>Apologetic</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700">Context (Email Thread)</label>
                <textarea className="w-full border-slate-300 rounded-lg shadow-sm p-2 border focus:ring-blue-500 text-sm" rows={4} placeholder="Paste the email chain here..." value={emailThread} onChange={(e) => setEmailThread(e.target.value)} />
              </div>

              <button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2">
                🔒 Generate Perfect Reply
              </button>

              {generatedReply && (
                <div className="mt-4 space-y-2 border-t pt-4">
                  <h2 className="text-sm font-semibold text-slate-800 flex items-center">
                    <span className="bg-green-100 text-green-700 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center mr-2">✓</span>
                    Your Drafted Reply
                  </h2>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 text-sm whitespace-pre-wrap">{generatedReply}</div>
                </div>
              )}
            </div>
          </div>
        </Show>

        <div className="text-center pb-4 pt-2 text-slate-500 text-xs">
          <p>© 2026 ReadyReply AI.</p>
        </div>
      </div>
    </ClerkProvider>
  );
}