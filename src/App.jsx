import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Download, TerminalSquare, AlertCircle, Settings, X, Key } from 'lucide-react';
import { generateRawSlides } from './services/gemini';
import { createUniversalDeck } from './services/pptx';

function App() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) setApiKey(savedKey);
  }, []);

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem("gemini_api_key", key);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (!apiKey) {
      setError("Please set your Gemini API Key in the settings first.");
      setIsSettingsOpen(true);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Send the huge prompt to Gemini to get JSON structure
      const deckData = await generateRawSlides(prompt, apiKey);

      // 2. Generate and download the .pptx file
      await createUniversalDeck(deckData);

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate presentation. See console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-animated flex items-center justify-center p-6 relative overflow-hidden">

      {/* Background aesthetic blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

      {/* Top Right Settings Button */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="absolute top-6 right-6 p-3 rounded-xl glass-panel text-neutral-400 hover:text-white transition-colors hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        title="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                <Key className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-white">Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => saveApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-neutral-900/50 border border-neutral-700/50 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-sm"
                />
                <p className="mt-2 text-xs text-neutral-500">
                  Your key is stored purely locally in your browser so you're the only one who has access to it.
                </p>
              </div>

              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl relative z-10 flex flex-col gap-8">

        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl glass-panel flex items-center justify-center border-indigo-500/30 mb-2">
            <TerminalSquare className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent">
            Slide Engine
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl font-light">
            The unopinionated, massive-context processing engine. Feed it a prompt dictating exactly what you want, and it outputs a complete <span className="text-pink-400 font-medium">.pptx</span> structure.
          </p>
        </div>

        {/* The Blank Canvas */}
        <div className="glass-panel rounded-3xl p-2 flex flex-col focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all duration-300">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={"e.g., Make a 10-slide pitch deck for a SaaS company. Tone: Aggressive. Style: Bullet points only. Length per slide: 3 lines."}
            className="w-full h-80 bg-transparent text-neutral-100 placeholder:text-neutral-600 outline-none resize-none p-6 text-lg font-light leading-relaxed scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent"
            spellCheck={false}
          />

          {/* Action Bar */}
          <div className="p-4 border-t border-neutral-800/50 flex items-center justify-between">
            <div className="flex-1 pr-4">
              {error && (
                <div className="flex items-center text-red-400 text-sm gap-2 animate-in fade-in zoom-in duration-300 bg-red-500/10 p-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="truncate">{error}</span>
                </div>
              )}
              {success && !error && (
                <div className="flex items-center text-emerald-400 text-sm gap-2 animate-in fade-in zoom-in duration-300 bg-emerald-500/10 p-2 rounded-lg">
                  <Download className="w-4 h-4 shrink-0" />
                  <span className="truncate">Presentation synthesized successfully!</span>
                </div>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="group shrink-0 relative inline-flex items-center justify-center gap-2 px-8 py-3 font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-indigo-200 group-hover:text-white transition-colors" />
                  <span>Generate .pptx</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
