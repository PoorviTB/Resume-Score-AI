import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Printer, Download, Sparkles } from 'lucide-react';
import { ScoringResult } from '../types';

interface ScoreGaugeProps {
  result: ScoringResult;
  onPrint: () => void;
  onExportMarkdown: () => void;
  onGenerateCoverLetter?: () => void;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  result,
  onPrint,
  onExportMarkdown,
  onGenerateCoverLetter,
}) => {
  const score = Math.max(0, Math.min(100, result.overallScore));

  // Determine color and status by score
  const getScoreTheme = (val: number) => {
    if (val >= 85) {
      return {
        color: 'text-emerald-600',
        stroke: '#059669',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: 'ATS Optimized (Ready for Application)',
        icon: CheckCircle2,
      };
    }
    if (val >= 70) {
      return {
        color: 'text-amber-600',
        stroke: '#d97706',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        label: 'Competitive (Needs Targeted Tweaks)',
        icon: AlertTriangle,
      };
    }
    return {
      color: 'text-rose-600',
      stroke: '#e11d48',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      label: 'High ATS Rejection Risk (Action Required)',
      icon: XCircle,
    };
  };

  const theme = getScoreTheme(score);
  const StatusIcon = theme.icon;

  // SVG circular calculation
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        
        {/* Left Side: Score Wheel & Quick Metrics */}
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
          {/* Radial Progress Ring */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-44 h-44 -rotate-90 transform" viewBox="0 0 160 160">
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-slate-100"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Progress Value */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={theme.stroke}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                {score}
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                out of 100
              </span>
              <div className="mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white">
                Grade {result.grade || (score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D')}
              </div>
            </div>
          </div>

          {/* Verdict and Status */}
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${theme.badgeBg}">
              <StatusIcon className="w-4 h-4" />
              <span>{theme.label}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {result.verdict}
            </h2>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 pt-1">
              <span>ATS Passing Benchmark: 75/100</span>
              <span aria-hidden="true">·</span>
              <span>Quantified Impact: {result.categoryScores?.impactAndMetrics?.quantifiedBulletsRatio || 'Evaluated'}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action Hub */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
          {onGenerateCoverLetter && (
            <button
              type="button"
              onClick={onGenerateCoverLetter}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Generate Match Cover Letter</span>
            </button>
          )}

          <button
            type="button"
            onClick={onExportMarkdown}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 transition-colors shadow-xs"
            title="Download report in Markdown format"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Report</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
            title="Print or save as PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Summary Narrative Box */}
      {result.summary && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Executive Talent Assessment
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {result.summary}
          </p>
        </div>
      )}
    </div>
  );
};
