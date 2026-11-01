import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import { SectionAuditItem } from '../types';

interface SectionAuditViewProps {
  auditItems: SectionAuditItem[];
  interviewQuestions: string[];
}

export const SectionAuditView: React.FC<SectionAuditViewProps> = ({
  auditItems,
  interviewQuestions,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pass':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-600',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'Pass',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-amber-600',
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          label: 'Needs Attention',
        };
      default:
        return {
          icon: XCircle,
          color: 'text-rose-600',
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          label: 'Missing / Deficient',
        };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Section-by-Section ATS Audit */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">Section-by-Section ATS Audit</h2>
          <p className="text-xs text-slate-500">
            Automated compliance check against ATS parser expectations for standard resume blocks
          </p>
        </div>

        <div className="space-y-3">
          {auditItems.map((item, idx) => {
            const status = getStatusBadge(item.status);
            const Icon = status.icon;

            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${status.color}`} />
                    <h3 className="text-sm font-semibold text-slate-900">
                      {item.sectionName}
                    </h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${status.badge}`}>
                    {status.label}
                  </span>
                </div>
                <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                  {item.recommendation}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Anticipated Interview Questions */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Anticipated Interview Inquiries
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            Probing questions recruiters and hiring managers will ask based on your detected gaps or claims
          </p>

          <div className="space-y-4">
            {interviewQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 relative overflow-hidden"
              >
                <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
                  Question {idx + 1}
                </div>
                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                  &ldquo;{q}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
          Tip: Formulate STAR method (Situation, Task, Action, Result) talking points for these questions before screening calls.
        </div>
      </div>
    </div>
  );
};
