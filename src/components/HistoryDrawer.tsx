import React from 'react';
import { X, Trash2, ArrowUpRight, TrendingUp, Clock, FileText } from 'lucide-react';
import { ResumeScanHistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: ResumeScanHistoryItem[];
  onSelect: (item: ResumeScanHistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelect,
  onDelete,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Scan History &amp; Progress
            </h2>
            <p className="text-xs text-slate-500">
              Track how your ATS scores improve across drafts
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>No previous scans saved yet.</p>
              <p className="mt-1 text-slate-500">Run an evaluation to start tracking your score progress!</p>
            </div>
          ) : (
            history.map((item, idx) => {
              const prevItem = history[idx + 1];
              const scoreDiff = prevItem ? item.overallScore - prevItem.overallScore : null;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50/50 transition-all shadow-xs group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="cursor-pointer flex-1"
                      onClick={() => {
                        onSelect(item);
                        onClose();
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-slate-900">
                          {item.overallScore}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          Grade {item.grade}
                        </span>
                        {scoreDiff !== null && scoreDiff !== 0 && (
                          <span
                            className={`text-xs font-semibold flex items-center gap-0.5 ${
                              scoreDiff > 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            <TrendingUp className="w-3 h-3" />
                            {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xs font-semibold text-slate-800 line-clamp-1">
                        {item.targetRole || 'General Resume Scan'}
                      </h3>

                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                        <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>·</span>
                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                        {item.jobDescriptionProvided && (
                          <>
                            <span>·</span>
                            <span className="text-indigo-600 font-medium">JD Matched</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onSelect(item);
                          onClose();
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Load this report"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete scan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {history.length} saved {history.length === 1 ? 'scan' : 'scans'}
            </span>
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors"
            >
              Clear All History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
