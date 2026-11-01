import React, { useState } from 'react';
import { Sparkles, Copy, Check, Share2, Compass } from 'lucide-react';

interface ExecutivePitchCardProps {
  pitch: string;
}

export const ExecutivePitchCard: React.FC<ExecutivePitchCardProps> = ({ pitch }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = pitch ? pitch.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              AI-Generated Executive Summary
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">
            High-Impact Elevator Pitch for Resume Header &amp; LinkedIn
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            {wordCount} words · ~20 sec read
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors shadow-sm cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="relative z-10 p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
          &ldquo;{pitch}&rdquo;
        </p>
      </div>

      <div className="relative z-10 mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-indigo-400" />
          <span>Place right beneath contact info to replace outdated generic &ldquo;Objective&rdquo; statements</span>
        </div>
      </div>
    </div>
  );
};
