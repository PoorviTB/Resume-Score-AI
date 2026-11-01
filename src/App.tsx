import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Layers, 
  TrendingUp, 
  Key, 
  Wand2, 
  CheckSquare, 
  MessageSquare, 
  FileEdit, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';

import { 
  ScoringResult, 
  ResumeScanHistoryItem, 
  ResumePreset 
} from './types';
import { SAMPLE_PRESETS } from './data/sampleResumes';
import { Header } from './components/Header';
import { ResumeInputForm } from './components/ResumeInputForm';
import { ScoreGauge } from './components/ScoreGauge';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { CriticalFixesCard } from './components/CriticalFixesCard';
import { KeywordMatrix } from './components/KeywordMatrix';
import { BulletRewriteLab } from './components/BulletRewriteLab';
import { SectionAuditView } from './components/SectionAuditView';
import { ExecutivePitchCard } from './components/ExecutivePitchCard';
import { HistoryDrawer } from './components/HistoryDrawer';
import { CoverLetterModal } from './components/CoverLetterModal';
import { ResumeEditorModal } from './components/ResumeEditorModal';

const HISTORY_STORAGE_KEY = 'resumescore_ai_history';

export default function App() {
  // Input states initialized with the first sample preset for immediate zero-friction discovery
  const defaultPreset = SAMPLE_PRESETS[0];

  const [resumeText, setResumeText] = useState(defaultPreset.resumeText);
  const [jobDescription, setJobDescription] = useState(defaultPreset.jobDescription || '');
  const [targetRole, setTargetRole] = useState(defaultPreset.role);
  const [industry, setIndustry] = useState(defaultPreset.industry);
  const [experienceLevel, setExperienceLevel] = useState(defaultPreset.experienceLevel);

  // Analysis result & loading states
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Tab in Scored View: 'overview' | 'keywords' | 'rewrites' | 'audit' | 'pitch'
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'rewrites' | 'audit' | 'pitch'>('overview');

  // Modals & Drawers
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Scan History
  const [history, setHistory] = useState<ResumeScanHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save history to localStorage', e);
    }
  }, [history]);

  // Preset Selection handler
  const handleSelectPreset = (preset: ResumePreset) => {
    setResumeText(preset.resumeText);
    setJobDescription(preset.jobDescription || '');
    setTargetRole(preset.role);
    setIndustry(preset.industry);
    setExperienceLevel(preset.experienceLevel);
  };

  // Run ATS Analysis
  const handleScoreResume = async (overrideResumeText?: string) => {
    const textToScore = overrideResumeText !== undefined ? overrideResumeText : resumeText;

    if (!textToScore.trim() || textToScore.trim().length < 30) {
      setErrorMessage('Please provide a complete resume with at least 30 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/score-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: textToScore,
          jobDescription: jobDescription.trim() || undefined,
          targetRole: targetRole.trim() || undefined,
          industry,
          experienceLevel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete resume evaluation.');
      }

      const data: ScoringResult = await response.json();
      setResult(data);

      // Trigger celebratory confetti if score is great or high-tier
      if (data.overallScore >= 80) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      }

      // Add to history
      const historyEntry: ResumeScanHistoryItem = {
        id: `scan-${Date.now()}`,
        timestamp: Date.now(),
        targetRole: targetRole || 'General Assessment',
        overallScore: data.overallScore,
        grade: data.grade,
        resumePreview: textToScore.slice(0, 150),
        jobDescriptionProvided: Boolean(jobDescription.trim()),
        result: data,
      };

      setHistory((prev) => [historyEntry, ...prev.slice(0, 19)]); // keep last 20 scans
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An unexpected error occurred while scoring the resume.');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-score from live editor
  const handleSaveAndRescore = async (newText: string) => {
    setResumeText(newText);
    setIsEditorOpen(false);
    await handleScoreResume(newText);
  };

  // Reset to initial clean state
  const handleReset = () => {
    setResult(null);
    setErrorMessage(null);
    setActiveTab('overview');
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  // Export as Markdown report
  const handleExportMarkdown = () => {
    if (!result) return;

    const content = `# ResumeScore AI Evaluation Report
**Target Role:** ${targetRole || 'Not specified'}
**Industry:** ${industry}
**Experience Level:** ${experienceLevel}
**Generated:** ${new Date().toLocaleString()}

---

## Overall Assessment
- **ATS Score:** ${result.overallScore} / 100
- **Grade:** ${result.grade}
- **Verdict:** ${result.verdict}

### Executive Assessment
${result.summary}

---

## Category Scores
- **Impact & Metrics:** ${result.categoryScores?.impactAndMetrics?.score}/100 (${result.categoryScores?.impactAndMetrics?.quantifiedBulletsRatio})
  ${result.categoryScores?.impactAndMetrics?.feedback}
- **ATS Compatibility:** ${result.categoryScores?.atsCompatibility?.score}/100
  ${result.categoryScores?.atsCompatibility?.feedback}
- **Skills & Keywords:** ${result.categoryScores?.skillsAndKeywords?.score}/100 (${result.categoryScores?.skillsAndKeywords?.matchPercentage}% match)
  ${result.categoryScores?.skillsAndKeywords?.feedback}
- **Brevity & Clarity:** ${result.categoryScores?.brevityAndClarity?.score}/100 (${result.categoryScores?.brevityAndClarity?.estimatedPages})
  ${result.categoryScores?.brevityAndClarity?.feedback}
- **Job Alignment:** ${result.categoryScores?.jobAlignment?.score}/100
  ${result.categoryScores?.jobAlignment?.feedback}

---

## Critical Fixes
${result.criticalFixes.map((f, i) => `### ${i + 1}. [${f.severity.toUpperCase()}] ${f.issue}\n- **Why it matters:** ${f.whyItMatters}\n- **How to fix:** ${f.howToFix}`).join('\n\n')}

---

## Standout Strengths
${result.keyStrengths.map((s) => `- ${s}`).join('\n')}

---

## Missing High-Value Keywords
${result.keywordAnalysis.missingKeywords.map((m) => `- **${m.keyword}** (${m.category} - ${m.importance}): ${m.context}`).join('\n')}

---

## Recommended Google XYZ Bullet Rewrites
${result.bulletRewrites.map((b, i) => `### Bullet ${i + 1}\n- **Original:** "${b.original}"\n- **Improved:** "${b.improved}"\n- **Formula:** [X] ${b.formula.action} | [Y] ${b.formula.metric} | [Z] ${b.formula.method}\n- **Coach Rationale:** ${b.reasoning}`).join('\n\n')}

---

## Executive Summary / Tailored Pitch
> "${result.tailoredPitch}"
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ResumeScore-Report-${(targetRole || 'candidate').replace(/\s+/g, '-')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        onReset={handleReset}
        hasResult={Boolean(result)}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner Introduction (Shown on input view or clean state) */}
        {!result && (
          <div className="text-center max-w-3xl mx-auto space-y-3 pt-2 pb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen ATS Algorithm &amp; Talent Evaluation</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              AI-Powered Resume Scoring &amp; Optimization
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Instant enterprise ATS compatibility grading, quantifiable XYZ bullet point transformations, and keyword gap analysis calibrated against modern hiring pipelines.
            </p>
          </div>
        )}

        {/* Error notification banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Analysis Failed</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-xs font-semibold text-rose-600 hover:text-rose-900"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* View Mode 1: Input Form */}
        {!result && (
          <ResumeInputForm
            resumeText={resumeText}
            setResumeText={setResumeText}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            industry={industry}
            setIndustry={setIndustry}
            experienceLevel={experienceLevel}
            setExperienceLevel={setExperienceLevel}
            onSubmit={() => handleScoreResume()}
            isLoading={isLoading}
            onSelectPreset={handleSelectPreset}
          />
        )}

        {/* View Mode 2: Comprehensive Scored Dashboard */}
        {result && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Top Score Gauge & Actions */}
            <ScoreGauge
              result={result}
              onPrint={handlePrint}
              onExportMarkdown={handleExportMarkdown}
              onGenerateCoverLetter={() => setIsCoverLetterOpen(true)}
            />

            {/* Navigation Tabs Bar & Live Editor Trigger */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-1.5 bg-slate-200/70 rounded-xl">
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'overview'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Overview &amp; Fixes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('keywords')}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'keywords'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Key className="w-4 h-4" />
                  <span>Keyword Gap Matrix</span>
                  {result.keywordAnalysis?.missingKeywords?.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] flex items-center justify-center font-bold">
                      {result.keywordAnalysis.missingKeywords.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('rewrites')}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'rewrites'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Wand2 className="w-4 h-4" />
                  <span>XYZ Bullet Lab</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('audit')}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'audit'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Section Audit &amp; Questions</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('pitch')}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'pitch'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Executive Pitch</span>
                </button>
              </div>

              {/* Live Resume Editor CTA */}
              <button
                type="button"
                onClick={() => setIsEditorOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <FileEdit className="w-4 h-4" />
                <span>Edit &amp; Re-Score Resume</span>
              </button>
            </div>

            {/* Tab 1: Overview & Pillars & Fixes */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <CategoryBreakdown categories={result.categoryScores} />
                <CriticalFixesCard
                  fixes={result.criticalFixes}
                  strengths={result.keyStrengths}
                />
              </div>
            )}

            {/* Tab 2: Keyword Gap Matrix */}
            {activeTab === 'keywords' && (
              <div className="space-y-6">
                <KeywordMatrix analysis={result.keywordAnalysis} />
              </div>
            )}

            {/* Tab 3: Google XYZ Bullet Rewrite Lab */}
            {activeTab === 'rewrites' && (
              <div className="space-y-6">
                <BulletRewriteLab
                  rewrites={result.bulletRewrites}
                  targetRole={targetRole}
                />
              </div>
            )}

            {/* Tab 4: Section-by-Section ATS Audit & Questions */}
            {activeTab === 'audit' && (
              <div className="space-y-6">
                <SectionAuditView
                  auditItems={result.sectionAudit}
                  interviewQuestions={result.suggestedInterviewQuestions}
                />
              </div>
            )}

            {/* Tab 5: Executive Pitch & Summary */}
            {activeTab === 'pitch' && (
              <div className="space-y-6">
                <ExecutivePitchCard pitch={result.tailoredPitch} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ResumeScore AI · Calibrated against Fortune 500 ATS Algorithms</span>
          <span>Powered by Gemini 3.8 Flash Server-Side Evaluation</span>
        </div>
      </footer>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={(item) => {
          setResult(item.result);
          setTargetRole(item.targetRole);
        }}
        onDelete={(id) => {
          setHistory((prev) => prev.filter((h) => h.id !== id));
        }}
        onClearAll={() => {
          setHistory([]);
          localStorage.removeItem(HISTORY_STORAGE_KEY);
        }}
      />

      {/* Cover Letter Generator Modal */}
      <CoverLetterModal
        isOpen={isCoverLetterOpen}
        onClose={() => setIsCoverLetterOpen(false)}
        resumeText={resumeText}
        jobDescription={jobDescription}
        targetRole={targetRole}
      />

      {/* Live Resume Editor Modal */}
      <ResumeEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        resumeText={resumeText}
        onSaveAndRescore={handleSaveAndRescore}
        isRescoring={isLoading}
      />
    </div>
  );
}
