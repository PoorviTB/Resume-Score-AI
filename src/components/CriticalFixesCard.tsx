import React from 'react';
import { AlertOctagon, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { CriticalFix } from '../types';

interface CriticalFixesCardProps {
  fixes: CriticalFix[];
  strengths: string[];
}

export const CriticalFixesCard: React.FC<CriticalFixesCardProps> = ({ fixes, strengths }) => {
  const getSeverityStyle = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return {
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: AlertOctagon,
          iconColor: 'text-rose-600',
          label: 'High Priority',
        };
      case 'medium':
        return {
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: AlertTriangle,
          iconColor: 'text-amber-600',
          label: 'Medium Priority',
        };
      default:
        return {
          badge: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: Info,
          iconColor: 'text-blue-600',
          label: 'Recommended',
        };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Critical Fixes Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Critical Red Flags &amp; Fixes</h2>
              <p className="text-xs text-slate-500">
                Prioritized issues most likely to trigger ATS drops or recruiter skips
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {fixes.length} Identified
            </span>
          </div>

          <div className="space-y-4">
            {fixes.map((fix, idx) => {
              const style = getSeverityStyle(fix.severity);
              const Icon = style.icon;

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 p-4 bg-slate-50/40 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 shrink-0 ${style.iconColor}`} />
                      <h3 className="text-sm font-bold text-slate-900">
                        {fix.issue}
                      </h3>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${style.badge}`}>
                      {style.label}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-semibold text-slate-600">Why ATS/Recruiters Reject: </span>
                      <span className="text-slate-600">{fix.whyItMatters}</span>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="font-semibold text-indigo-700 block mb-0.5">How to Fix:</span>
                      <p className="text-slate-800 leading-relaxed">{fix.howToFix}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Validated Strengths Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Standout Strengths</h2>
              <p className="text-xs text-slate-500">
                High-scoring elements and competitive advantages to keep
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {strengths.length} Confirmed
            </span>
          </div>

          <div className="space-y-3">
            {strengths.map((str, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/30 text-xs sm:text-sm text-slate-800"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{str}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>Preserve these strong structures when editing</span>
          <span className="font-medium text-slate-700">ATS Pass Rate Boost</span>
        </div>
      </div>
    </div>
  );
};
