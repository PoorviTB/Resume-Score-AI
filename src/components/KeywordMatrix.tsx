import React, { useState } from 'react';
import { Check, Copy, AlertCircle, PlusCircle, Search } from 'lucide-react';
import { KeywordAnalysis, MissingKeyword } from '../types';

interface KeywordMatrixProps {
  analysis: KeywordAnalysis;
}

export const KeywordMatrix: React.FC<KeywordMatrixProps> = ({ analysis }) => {
  const [filter, setFilter] = useState<'all' | 'essential' | 'recommended' | 'found'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);

  const handleCopy = (keyword: string) => {
    navigator.clipboard.writeText(keyword);
    setCopiedKeyword(keyword);
    setTimeout(() => {
      setCopiedKeyword(null);
    }, 2000);
  };

  const foundKeywords = analysis.foundKeywords || [];
  const missingKeywords = analysis.missingKeywords || [];

  const filteredMissing = missingKeywords.filter((item: MissingKeyword) => {
    const matchesSearch = item.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'essential') return item.importance === 'Essential';
    if (filter === 'recommended') return item.importance === 'Recommended';
    if (filter === 'found') return false;
    return true;
  });

  const filteredFound = filter === 'essential' || filter === 'recommended'
    ? []
    : foundKeywords.filter((k: string) => k.toLowerCase().includes(searchQuery.toLowerCase()));

  const essentialCount = missingKeywords.filter((m: MissingKeyword) => m.importance === 'Essential').length;
  const recommendedCount = missingKeywords.filter((m: MissingKeyword) => m.importance === 'Recommended').length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">ATS Keyword Gap Analysis</h2>
          <p className="text-xs text-slate-500">
            Compare recognized resume skills against industry &amp; job description expectations
          </p>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-44"
            />
          </div>

          {/* Filter Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({foundKeywords.length + missingKeywords.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('essential')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filter === 'essential' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Essential ({essentialCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('recommended')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filter === 'recommended' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recommended ({recommendedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('found')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filter === 'found' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Matched ({foundKeywords.length})
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Missing Keywords vs Matched Keywords */}
      <div className="space-y-6">
        {/* Missing Keywords Section */}
        {filteredMissing.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Missing High-Value Keywords &amp; Competencies
              </h3>
              <span className="text-xs text-slate-400">· Click any keyword to copy</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredMissing.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCopy(item.keyword)}
                  className="group relative p-3 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50/50 transition-all cursor-pointer shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {item.keyword}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${
                        item.importance === 'Essential'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {item.importance}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 mb-2">
                    Category: <span className="text-slate-700 font-medium">{item.category}</span>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="font-medium text-slate-700">Placement tip: </span>
                    {item.context}
                  </div>

                  <div className="mt-2 flex items-center justify-end text-[11px] text-indigo-600 font-medium gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {copiedKeyword === item.keyword ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied to clipboard</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy keyword</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Found Keywords Section */}
        {filteredFound.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Check className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Matched Keywords Detected in Resume ({filteredFound.length})
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {filteredFound.map((kw: string, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleCopy(kw)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-200 bg-emerald-50/50 text-emerald-800 hover:bg-emerald-100/60 transition-colors group cursor-pointer"
                  title="Click to copy"
                >
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>{kw}</span>
                  {copiedKeyword === kw && (
                    <span className="text-[10px] text-emerald-700 font-bold ml-1">Copied!</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredMissing.length === 0 && filteredFound.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-xs">
            No keywords match your search query &quot;{searchQuery}&quot;.
          </div>
        )}
      </div>
    </div>
  );
};
