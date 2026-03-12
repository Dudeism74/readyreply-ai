import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini AI using your secure Vite environment variable
const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export default function App() {
  // All the state variables to power our new features
  const [companyKnowledge, setCompanyKnowledge] = useState('');
  const [brandVoice, setBrandVoice] = useState('');
  const [emailThread, setEmailThread] = useState('');
  const [goal, setGoal] = useState('Resolve Customer Issue');
  const [tone, setTone] = useState('Professional');
  const [generatedReply, setGeneratedReply] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!emailThread) return alert("Please paste an email thread first!");
    
    setIsGenerating(true);
    setGeneratedReply('');

    try {
      const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      // This is the "Mega-Prompt" that combines all the new features to create massive value
      const prompt = `
        You are an elite, highly-paid communication and customer support assistant. 

        COMPANY KNOWLEDGE & POLICIES:
        ${companyKnowledge ? companyKnowledge : 'Use standard professional best practices.'}

        BRAND VOICE & WRITING STYLE:
        ${brandVoice ? brandVoice : 'Write in a clear, polite, and standard professional tone.'}

       TASK:
        Write a response to the following email thread. 
        Goal of the response: ${goal}
        Desired Tone: ${tone}
        CRITICAL INSTRUCTION: Analyze the email thread to find the customer's name. Always address them by their name in the greeting (e.g., "Hi [Name],"). If absolutely no name can be found, use a polite, professional greeting.

        EMAIL THREAD:
        ${emailThread}

        Draft the response email now. Provide ONLY the email text. Do not include any intro or outro commentary like "Here is your email:".
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
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">ReadyReply AI <span className="text-blue-600">Pro</span></h1>
          <p className="mt-4 text-lg text-slate-600">Your personalized, context-aware email copilot.</p>
        </div>

        <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-6 md:p-8 space-y-8">
          
          {/* Step 1: System Settings */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center">
              <span className="bg-blue-100 text-blue-700 text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center mr-3">1</span>
              System Settings (Optional)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Knowledge & Policies</label>
                <textarea 
                  className="w-full border-slate-300 rounded-lg shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500" 
                  rows={3} 
                  placeholder="e.g., 'We offer a 30-day return policy. Shipping is always free. CEO is named Dave.'"
                  value={companyKnowledge}
                  onChange={(e) => setCompanyKnowledge(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Brand Voice (Paste Old Emails)</label>
                <textarea 
                  className="w-full border-slate-300 rounded-lg shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500" 
                  rows={3} 
                  placeholder="Paste 1-2 examples of how you normally write so the AI can mimic your style."
                  value={brandVoice}
                  onChange={(e) => setBrandVoice(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Step 2: Goal & Tone */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center">
              <span className="bg-blue-100 text-blue-700 text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center mr-3">2</span>
              Goal & Tone
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">What is the goal of this email?</label>
                <select 
                  className="w-full border-slate-300 rounded-lg shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                >
                  <option>Resolve Customer Issue</option>
                  <option>Politely Decline</option>
                  <option>Follow Up on Pitch</option>
                  <option>Negotiate Terms</option>
                  <option>Ask for Extension</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tone</label>
                <select 
                  className="w-full border-slate-300 rounded-lg shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option>Professional</option>
                  <option>Friendly & Warm</option>
                  <option>Firm & Direct</option>
                  <option>Apologetic</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 3: The Email */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center">
              <span className="bg-blue-100 text-blue-700 text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center mr-3">3</span>
              Context
            </h2>
            <textarea 
              className="w-full border-slate-300 rounded-lg shadow-sm p-4 border focus:ring-blue-500 focus:border-blue-500" 
              rows={6} 
              placeholder="Paste the entire email chain or the difficult email here..."
              value={emailThread}
              onChange={(e) => setEmailThread(e.target.value)}
            />
          </div>

          {/* Generate Button */}
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {isGenerating ? 'Analyzing & Drafting...' : 'Generate Perfect Reply'}
          </button>

          {/* Output Area */}
          {generatedReply && (
            <div className="mt-8 space-y-4 border-t pt-8">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                <span className="bg-green-100 text-green-700 text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center mr-3">✓</span>
                Your Drafted Reply
              </h2>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-slate-800 whitespace-pre-wrap">
                {generatedReply}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
