import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, Copy, Wand2, Lightbulb, RefreshCw } from 'lucide-react';
import { BulletRewrite, BulletRewriteResponse } from '../types';

interface BulletRewriteLabProps {
  rewrites: BulletRewrite[];
  targetRole?: string;
}

export const BulletRewriteLab: React.FC<BulletRewriteLabProps> = ({ rewrites, targetRole }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Custom Live Bullet Playground State
  const [customBullet, setCustomBullet] = useState('');
  const [customMetric, setCustomMetric] = useState('');
  const [isRewritingCustom, setIsRewritingCustom] = useState(false);
  const [customResult, setCustomResult] = useState<BulletRewriteResponse | null>(null);
  const [copiedCustomStyle, setCopiedCustomStyle] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyCustom = (text: string, style: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCustomStyle(style);
    setTimeout(() => setCopiedCustomStyle(null), 2000);
  };

  const handleRewriteCustomBullet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBullet.trim()) return;

    setIsRewritingCustom(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/rewrite-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalBullet: customBullet,
          contextRole: targetRole || 'Professional Role',
          targetMetric: customMetric,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to rewrite bullet');
      }

      const data: BulletRewriteResponse = await res.json();
      setCustomResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while rewriting.');
    } finally {
      setIsRewritingCustom(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">
            Google XYZ Bullet Point Transformation Lab
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Transform weak duty statements into quantifiable achievement bullets using the industry-standard formula:
          <span className="font-semibold text-slate-700 ml-1">
            Accomplished [X], as measured by [Y], by doing [Z]
          </span>
        </p>
      </div>

      {/* Extracted Resume Rewrites */}
      <div className="space-y-6">
        {rewrites.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/30"
          >
            {/* Top before & after comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              
              {/* Original Weak Bullet */}
              <div className="p-4 sm:p-5 bg-rose-50/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded">
                    Original Bullet
                  </span>
                  <span className="text-xs text-slate-500">Passive / Unmeasured</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                  &ldquo;{item.original}&rdquo;
                </p>
              </div>

              {/* Enhanced High-Impact Bullet */}
              <div className="p-4 sm:p-5 bg-emerald-50/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Optimized (XYZ Formula)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.improved, idx)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                      title="Copy improved bullet to clipboard"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-900 font-medium leading-relaxed">
                    &ldquo;{item.improved}&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Formula Breakdown & Rationale */}
            <div className="p-4 bg-white border-t border-slate-200 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-700 block mb-0.5">[X] Accomplishment:</span>
                  <span className="text-slate-600">{item.formula?.action || 'Target outcome'}</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50/40 border border-emerald-100">
                  <span className="font-bold text-emerald-800 block mb-0.5">[Y] Measurable Metric:</span>
                  <span className="text-slate-600">{item.formula?.metric || 'Quantified scale'}</span>
                </div>
                <div className="p-2 rounded-lg bg-indigo-50/40 border border-indigo-100">
                  <span className="font-bold text-indigo-800 block mb-0.5">[Z] Method / Action:</span>
                  <span className="text-slate-600">{item.formula?.method || 'Action taken'}</span>
                </div>
              </div>

              <div className="flex items-start gap-1.5 text-slate-500 pt-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span><strong className="text-slate-700">Coach Insight:</strong> {item.reasoning}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Live Bullet Rewriter Playground */}
      <div className="mt-8 pt-8 border-t border-slate-200">
        <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/30 to-purple-50/20 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <Wand2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Interactive Bullet Rewriter Playground
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Test any single bullet point from your draft and generate three tailored, metric-driven variants on demand.
          </p>

          <form onSubmit={handleRewriteCustomBullet} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Draft Bullet Point
                </label>
                <input
                  type="text"
                  value={customBullet}
                  onChange={(e) => setCustomBullet(e.target.value)}
                  placeholder="e.g. Responsible for managing customer tickets and updating databases..."
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Key Metric / Scale (Optional)
                </label>
                <input
                  type="text"
                  value={customMetric}
                  onChange={(e) => setCustomMetric(e.target.value)}
                  placeholder="e.g. cut resolution time by 30%, $1.2M pipeline"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Applies Google XYZ framework and active power verbs
              </span>
              <button
                type="submit"
                disabled={isRewritingCustom || !customBullet.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs ml-auto"
              >
                {isRewritingCustom ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing &amp; Rewriting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate 3 Variations</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="mt-3 p-3 text-xs rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Custom Rewrite Results */}
          {customResult && (
            <div className="mt-6 pt-5 border-t border-indigo-100 space-y-4">
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700">
                <span className="font-bold text-slate-800">Reviewer Critique: </span>
                {customResult.critique}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {customResult.variations?.map((variant, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {variant.style}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Verb: {variant.actionVerb}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed mb-2">
                        &ldquo;{variant.bullet}&rdquo;
                      </p>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        {variant.explanation}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCustom(variant.bullet, variant.style)}
                      className="mt-3 pt-2 border-t border-slate-100 w-full text-right text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center justify-end gap-1"
                    >
                      {copiedCustomStyle === variant.style ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy variant</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
