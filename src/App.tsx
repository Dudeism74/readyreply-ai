import { useState, useEffect } from 'react';
import { ClerkProvider, Show, SignInButton, UserButton, useAuth } from '@clerk/react';
declare const chrome: any;
const PUBLISHABLE_KEY = "pk_live_Y2xlcmsucmVhZHlyZXBseWFpLmNvbSQ";
const STRIPE_LINK = "https://buy.stripe.com/6oU4gr6iR3QVaSe1Rg1B600";

function AppContent() {
  const { getToken, isSignedIn } = useAuth();
  const [companyKnowledge, setCompanyKnowledge] = useState('');
  const [brandVoice, setBrandVoice] = useState('');
  const [emailThread, setEmailThread] = useState('');
  const [goal, setGoal] = useState('Resolve Customer Issue');
  const [tone, setTone] = useState('Professional');
  const [generatedReply, setGeneratedReply] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // --- NEW: Sync Clerk JWT with Chrome Extension ---
  useEffect(() => {
    const syncTokenWithExtension = async () => {
      // Only attempt to sync if the user is actively signed in
      if (isSignedIn) {
        try {
          const token = await getToken();
          // REPLACE THIS WITH YOUR ACTUAL CHROME EXTENSION ID
          const EXTENSION_ID = 'kmlfjibfnimopokgdokilgakajfhebfm';

          if ((window as any).chrome && (window as any).chrome.runtime && token) {
            chrome.runtime.sendMessage(EXTENSION_ID, {
              action: "storeClerkToken",
              token: token
            }, (response) => {
              if (chrome.runtime.lastError) {
                // Not a fatal error, extension might not be reachable or is missing externally_connectable
                console.debug("Extension not reachable yet:", chrome.runtime.lastError);
              } else {
                console.log("Successfully synced Clerk token to extension!");
              }
            });
          }
        } catch (error) {
          console.error("Error grabbing token for extension sync:", error);
        }
      }
    };

    // Sync immediately on sign-in or reload
    syncTokenWithExtension();

    // Set an interval to re-sync the token every 5 minutes so it doesn't expire
    const intervalId = setInterval(syncTokenWithExtension, 1000 * 60 * 5);

    return () => clearInterval(intervalId);
  }, [getToken, isSignedIn]);
  // -----------------------------------------------

  const handleGenerate = async () => {
    if (!emailThread) return alert("Please paste an email thread first!");
    setIsGenerating(true);
    setGeneratedReply('');

    try {
      const token = await getToken();

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          emailText: emailThread,
          tone,
          goal,
          companyKnowledge,
          brandVoice
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setGeneratedReply(data.error || 'Error generating reply. Please check your connection.');
        setIsGenerating(false);
        return;
      }

      setGeneratedReply(data.text);
    } catch (error) {
      console.error(error);
      setGeneratedReply('Error generating reply. Please check your connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-slate-50 w-full min-h-screen mx-auto flex flex-col shadow-xl">
      <div className="flex justify-between items-center p-4 bg-white shadow-sm mb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">ReadyReply AI</h1>
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
        <div className="w-full flex-grow flex flex-col">
          {/* Section 1: Hero */}
          <section className="flex flex-col items-center justify-center px-6 py-24 text-center bg-white">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight max-w-4xl">
              The Ultimate <span className="text-blue-600">AI Gmail Assistant</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              ReadyReply AI learns your brand voice and writes the perfect customer support response instantly. Automate customer service emails and scale your support without losing the human touch.
            </p>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl shadow-xl text-lg transition-transform transform hover:scale-105">
                Start 7-Day Free Trial
              </button>
            </SignInButton>
          </section>

          {/* Section 2: How It Works */}
          <section className="py-24 px-6 bg-slate-50">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-extrabold text-center text-slate-900 mb-16">How Our <span className="text-blue-600">Gmail AI Automation</span> Works</h2>
              <div className="grid md:grid-cols-3 gap-10">
                <div className="bg-white p-10 rounded-3xl shadow-md text-center transform hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-inner">1</div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-800">Define Brand Voice</h3>
                  <p className="text-slate-600 leading-relaxed">Provide your company knowledge and desired tone. The AI learns exactly how your business communicates.</p>
                </div>
                <div className="bg-white p-10 rounded-3xl shadow-md text-center transform hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-inner">2</div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-800">Paste the Thread</h3>
                  <p className="text-slate-600 leading-relaxed">Simply drop in the difficult support email or question. Our AI reads the full context instantly.</p>
                </div>
                <div className="bg-white p-10 rounded-3xl shadow-md text-center transform hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-inner">3</div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-800">Generate Reply</h3>
                  <p className="text-slate-600 leading-relaxed">Click a button to automate customer service emails with an accurate, perfectly-toned response ready to send.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Features */}
          <section className="py-24 px-6 bg-white border-t border-slate-100">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-extrabold text-center text-slate-900 mb-16">Powerful Features for Seamless Support</h2>
              <div className="grid md:grid-cols-3 gap-12">
                <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm">⚡</div>
                  <h3 className="text-2xl font-bold mb-3 text-slate-800">Lightning Speed</h3>
                  <p className="text-slate-600 leading-relaxed">Draft complex support replies in seconds, dramatically reducing your average handle time to zero.</p>
                </div>
                <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl">
                  <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm">🎭</div>
                  <h3 className="text-2xl font-bold mb-3 text-slate-800">Dynamic Tone Control</h3>
                  <p className="text-slate-600 leading-relaxed">Switch from "Professional" to "Friendly & Warm" instantly to perfectly match the customer's mood.</p>
                </div>
                <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl">
                  <div className="w-20 h-20 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm">🔒</div>
                  <h3 className="text-2xl font-bold mb-3 text-slate-800">API Security</h3>
                  <p className="text-slate-600 leading-relaxed">Enterprise-grade API security ensures your data and Stripe payments are completely protected under Clerk authentication.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </Show>

      <Show when="signed-in">
        <div className="px-4 pb-6 space-y-6 flex-grow max-w-2xl mx-auto w-full">
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

      <div className="text-center pb-8 pt-4 text-slate-500 text-sm space-y-2">
        <p>© 2026 ReadyReply AI.</p>
        <a href="/privacy.html" className="hover:text-blue-600 transition-colors block">Privacy Policy</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <AppContent />
    </ClerkProvider>
  );
}