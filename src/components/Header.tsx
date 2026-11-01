import React from 'react';
import { Sparkles, FileText, History, RotateCcw, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenHistory: () => void;
  onReset: () => void;
  hasResult: boolean;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onReset,
  hasResult,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">ResumeScore AI</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                ATS Grader
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Calibrated against modern Enterprise ATS algorithms
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenHistory}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="View scan history"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Score History</span>
            {historyCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-semibold">
                {historyCount}
              </span>
            )}
          </button>

          {hasResult && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Start a new resume review"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">New Scan</span>
            </button>
          )}

          <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-slate-200 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Private & Client-Confidential</span>
          </div>
        </div>
      </div>
    </header>
  );
};
