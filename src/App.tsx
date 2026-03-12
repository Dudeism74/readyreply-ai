/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Send, Copy, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Define the available tones for the reply
const TONES = [
  { id: 'professional', label: 'Professional' },
  { id: 'friendly', label: 'Friendly' },
  { id: 'firm', label: 'Firm' },
  { id: 'apologetic', label: 'Apologetic' },
];

export default function App() {
  // State variables to manage the application's data
  const [emailText, setEmailText] = useState('');
  const [selectedTone, setSelectedTone] = useState(TONES[0].id);
  const [generatedReply, setGeneratedReply] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState('');

  // Function to handle the generation of the reply
  const handleGenerate = async () => {
    // Basic validation
    if (!emailText.trim()) {
      setError('Please enter an email to reply to.');
      return;
    }

    // Reset states before generating
    setIsGenerating(true);
    setError('');
    setGeneratedReply('');
    setIsCopied(false);

    try {
      // Find the label for the selected tone
      const toneLabel = TONES.find((t) => t.id === selectedTone)?.label || 'Professional';
      
      // Construct the prompt for the Gemini model
      const prompt = `You are an expert communicator. I received the following difficult/angry email. Please write a ${toneLabel.toLowerCase()}, well-crafted, and polite reply to it. Do not include any placeholder text like [Your Name], just write the body of the email.

Received Email:
"""
${emailText}
"""

Reply:`;

      // Call the Gemini API to generate the content
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      // Update the state with the generated reply
      setGeneratedReply(response.text || 'Could not generate a reply. Please try again.');
    } catch (err) {
      console.error('Error generating reply:', err);
      setError('An error occurred while generating the reply. Please try again.');
    } finally {
      // Ensure loading state is turned off
      setIsGenerating(false);
    }
  };

  // Function to handle copying the generated reply to the clipboard
  const handleCopy = async () => {
    if (!generatedReply) return;
    try {
      await navigator.clipboard.writeText(generatedReply);
      setIsCopied(true);
      // Reset the copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header Section */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-800">ReadyReply AI</h1>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="space-y-8">
          
          {/* Introduction/Hero Section */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              Turn difficult emails into <span className="text-blue-600">perfect replies</span>
            </h2>
            <p className="text-lg text-slate-600">
              Paste the email you received, choose your desired tone, and let AI craft a polite, professional response in seconds.
            </p>
          </div>

          {/* Two-column layout for input and output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
            
            {/* Left Column: Input Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-medium text-slate-700 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">1</span>
                  Paste Email
                </h3>
              </div>
              <div className="p-5 flex-grow flex flex-col gap-5">
                {/* Textarea for pasting the email */}
                <textarea
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                  placeholder="Paste the angry or difficult email here..."
                  className="w-full flex-grow min-h-[200px] md:min-h-[250px] p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-slate-700 placeholder:text-slate-400 text-base"
                />
                
                {/* Dropdown for selecting the tone */}
                <div className="space-y-2">
                  <label htmlFor="tone" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">2</span>
                    Select Tone
                  </label>
                  <div className="relative">
                    <select
                      id="tone"
                      value={selectedTone}
                      onChange={(e) => setSelectedTone(e.target.value)}
                      className="w-full p-3.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700 appearance-none cursor-pointer text-base font-medium shadow-sm"
                    >
                      {TONES.map((tone) => (
                        <option key={tone.id} value={tone.id}>
                          {tone.label}
                        </option>
                      ))}
                    </select>
                    {/* Custom dropdown arrow */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Error message display */}
                {error && (
                  <p className="text-red-500 text-sm font-medium">{error}</p>
                )}

                {/* Generate button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !emailText.trim()}
                  className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-[0.98] mt-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Crafting Reply...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Generate Reply
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Output Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-medium text-slate-700 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">3</span>
                  Your Reply
                </h3>
                {/* Copy button (only visible when there is a generated reply) */}
                {generatedReply && (
                  <button
                    onClick={handleCopy}
                    className="text-slate-500 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
                    title="Copy to clipboard"
                  >
                    {isCopied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="p-6 flex-grow flex flex-col bg-slate-50/30">
                {/* Display the generated reply or a placeholder */}
                {generatedReply ? (
                  <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700 text-base leading-relaxed">
                    {generatedReply}
                  </div>
                ) : (
                  <div className="flex-grow flex flex-col items-center justify-center text-slate-400 text-center space-y-4 p-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm">
                      <Sparkles className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="max-w-[200px] text-sm">Your generated reply will appear here.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
