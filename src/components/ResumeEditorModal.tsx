import React, { useState } from 'react';
import { X, RefreshCw, FileText, CheckCircle, Sparkles } from 'lucide-react';

interface ResumeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeText: string;
  onSaveAndRescore: (newText: string) => void;
  isRescoring: boolean;
}

export const ResumeEditorModal: React.FC<ResumeEditorModalProps> = ({
  isOpen,
  onClose,
  resumeText,
  onSaveAndRescore,
  isRescoring,
}) => {
  const [draft, setDraft] = useState(resumeText);

  if (!isOpen) return null;

  const wordCount = draft ? draft.trim().split(/\s+/).filter(Boolean).length : 0;
  const bulletCount = (draft.match(/^[-*•]\s+/gm) || []).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Live Resume Editor &amp; Re-Scorer
              </h2>
              <p className="text-xs text-slate-500">
                Apply improvements and immediately calculate your new ATS score
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Editor Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Edit directly, paste rewritten XYZ bullets, and insert missing keywords</span>
            <div className="flex items-center gap-3">
              <span>{wordCount} Words</span>
              <span>·</span>
              <span>{bulletCount} Bullet points detected</span>
            </div>
          </div>

          <textarea
            rows={18}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full flex-1 text-xs sm:text-sm font-sans p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed text-slate-800"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onSaveAndRescore(draft)}
            disabled={isRescoring || !draft.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
          >
            {isRescoring ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Re-evaluating ATS Score...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Apply Edits &amp; Re-Score</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
