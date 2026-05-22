import React, { useState } from 'react';
import WebcamCapture from './components/WebcamCapture';
import { HandMetal } from 'lucide-react';

function App() {
  const [currentSign, setCurrentSign] = useState("Waiting...");
  const [confidence, setConfidence] = useState(0);

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
              <HandMetal className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Sign Interpreter
              </h1>
              <p className="text-neutral-400 text-sm">Real-time ASL translation</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900/50 rounded-full border border-neutral-800">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-neutral-300 tracking-wide uppercase">System Online</span>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Webcam Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl group">
              <WebcamCapture onSignDetected={(sign, conf) => {
                setCurrentSign(sign);
                setConfidence(conf);
              }} />
              <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-3xl pointer-events-none transition-colors group-hover:border-indigo-500/40"></div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <div className="p-8 rounded-3xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
              
              <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-6">Current Translation</h2>
              
              <div className="flex flex-col items-center justify-center p-8 bg-neutral-950/50 rounded-2xl border border-neutral-800/50 shadow-inner">
                <span className="text-8xl font-bold bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent drop-shadow-sm">
                  {currentSign}
                </span>
              </div>

              {currentSign !== "Unknown" && currentSign !== "Waiting..." && (
                <div className="mt-6">
                  <div className="flex justify-between text-xs text-neutral-400 mb-2">
                    <span>Confidence</span>
                    <span>{Math.round(confidence * 100)}%</span>
                  </div>
                  <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-800/50">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-300 ease-out"
                      style={{ width: `${confidence * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 backdrop-blur-xl">
              <h3 className="text-sm font-medium text-indigo-300 mb-2">Instructions</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Ensure you are in a well-lit environment. Hold your hand up to the camera and perform American Sign Language (ASL) alphabet signs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
