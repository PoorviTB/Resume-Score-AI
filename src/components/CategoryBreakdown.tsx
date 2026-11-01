import React, { useState } from 'react';
import { 
  TrendingUp, 
  FileCheck, 
  Cpu, 
  AlignLeft, 
  Target, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle 
} from 'lucide-react';
import { CategoryScores } from '../types';

interface CategoryBreakdownProps {
  categories: CategoryScores;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ categories }) => {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const toggleExpand = (key: string) => {
    setExpandedKey(prev => (prev === key ? null : key));
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' };
    if (score >= 70) return { bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' };
    return { bar: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' };
  };

  const cards = [
    {
      key: 'impactAndMetrics',
      title: 'Impact & Quantified Metrics',
      icon: TrendingUp,
      score: categories.impactAndMetrics?.score ?? 0,
      metricBadge: categories.impactAndMetrics?.quantifiedBulletsRatio,
      feedback: categories.impactAndMetrics?.feedback,
      help: 'Evaluates Google XYZ formula adoption: "Accomplished [X] measured by [Y] by doing [Z]". Prioritizes numbers, % improvements, and scale.',
    },
    {
      key: 'atsCompatibility',
      title: 'ATS Parsability & Format',
      icon: FileCheck,
      score: categories.atsCompatibility?.score ?? 0,
      feedback: categories.atsCompatibility?.feedback,
      flags: categories.atsCompatibility?.parsabilityFlags,
      help: 'Scans for clean hierarchy, standard section headers, contact parsing, and absence of tables/columns that choke Applicant Tracking Systems.',
    },
    {
      key: 'skillsAndKeywords',
      title: 'Skills & Keyword Density',
      icon: Cpu,
      score: categories.skillsAndKeywords?.score ?? 0,
      metricBadge: categories.skillsAndKeywords?.matchPercentage ? `${categories.skillsAndKeywords.matchPercentage}% Coverage` : undefined,
      feedback: categories.skillsAndKeywords?.feedback,
      help: 'Checks modern industry tooling, framework mentions, domain methodologies, and contextual hard & soft skills.',
    },
    {
      key: 'brevityAndClarity',
      title: 'Brevity, Tone & Word Economy',
      icon: AlignLeft,
      score: categories.brevityAndClarity?.score ?? 0,
      metricBadge: categories.brevityAndClarity?.estimatedPages,
      feedback: categories.brevityAndClarity?.feedback,
      help: 'Detects active voice verbs, wordiness, passive duties ("responsible for"), and appropriate document density.',
    },
    {
      key: 'jobAlignment',
      title: 'Target Role Alignment',
      icon: Target,
      score: categories.jobAlignment?.score ?? 0,
      feedback: categories.jobAlignment?.feedback,
      help: 'Direct qualification match against the target job description or the standard senior/lead expectations of the role.',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Core Evaluation Pillars</h2>
          <p className="text-xs text-slate-500">
            Granular scoring across the five critical ATS screening vectors
          </p>
        </div>
        <span className="text-xs text-slate-400">
          Click any pillar for diagnostic details
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const colors = getScoreColor(card.score);
          const Icon = card.icon;
          const isExpanded = expandedKey === card.key;

          return (
            <div
              key={card.key}
              onClick={() => toggleExpand(card.key)}
              className={`rounded-xl border p-4 cursor-pointer transition-all ${
                isExpanded 
                  ? 'border-indigo-400 ring-2 ring-indigo-50 bg-slate-50/50' 
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <Icon className={`w-4 h-4 ${colors.text}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 leading-tight">
                      {card.title}
                    </h3>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${colors.text}`}>
                    {card.score}
                  </span>
                  <span className="text-xs text-slate-400">/100</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
                  style={{ width: `${Math.max(4, card.score)}%` }}
                />
              </div>

              {/* Secondary Metric / Indicator */}
              {card.metricBadge && (
                <div className="text-xs font-medium text-slate-600 mb-2">
                  {card.metricBadge}
                </div>
              )}

              {/* Summary / Toggle Trigger */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                <span className="line-clamp-1">{isExpanded ? 'Hide diagnostic' : 'View diagnostic'}</span>
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>

              {/* Expandable Diagnostic Panel */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-700 space-y-2 animate-in fade-in duration-200">
                  <p className="leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200 text-slate-800">
                    {card.feedback}
                  </p>
                  
                  {card.flags && card.flags.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="font-semibold text-slate-600 block">System Flags:</span>
                      {card.flags.map((flag, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-slate-600">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{flag}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 italic">
                    {card.help}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
