import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Briefcase, 
  Sparkles, 
  Trash2, 
  BookOpen, 
  Building2, 
  Layers, 
  ArrowRight,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import { SAMPLE_PRESETS } from '../data/sampleResumes';
import { ResumePreset } from '../types';

interface ResumeInputFormProps {
  resumeText: string;
  setResumeText: (text: string) => void;
  jobDescription: string;
  setJobDescription: (text: string) => void;
  targetRole: string;
  setTargetRole: (role: string) => void;
  industry: string;
  setIndustry: (ind: string) => void;
  experienceLevel: string;
  setExperienceLevel: (lvl: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onSelectPreset: (preset: ResumePreset) => void;
}

export const ResumeInputForm: React.FC<ResumeInputFormProps> = ({
  resumeText,
  setResumeText,
  jobDescription,
  setJobDescription,
  targetRole,
  setTargetRole,
  industry,
  setIndustry,
  experienceLevel,
  setExperienceLevel,
  onSubmit,
  isLoading,
  onSelectPreset,
}) => {
  const [includeJobDescription, setIncludeJobDescription] = useState(Boolean(jobDescription));
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = resumeText ? resumeText.trim().split(/\s+/).filter(Boolean).length : 0;
  const jdWordCount = jobDescription ? jobDescription.trim().split(/\s+/).filter(Boolean).length : 0;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setResumeText(content);
      }
    };
    reader.readAsText(file);
  };

  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = SAMPLE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      onSelectPreset(preset);
      if (preset.jobDescription) {
        setIncludeJobDescription(true);
      }
    }
  };

  const industries = [
    'Software & Technology',
    'Product & Project Management',
    'Data Science & Analytics',
    'Finance & Fintech',
    'Healthcare & Biotech',
    'Marketing & Growth',
    'Design & Creative',
    'Operations & Supply Chain',
    'General Corporate',
  ];

  const experienceLevels = [
    'Entry Level (0 - 2 years)',
    'Mid-Level (3 - 5 years)',
    'Senior Level (5 - 8 years)',
    'Staff / Principal / Director (8+ years)',
    'Executive / VP / C-Suite',
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
      
      {/* Top Banner: Quick Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
          <div>
            <span className="text-xs font-bold text-slate-800">
              Quick Test Presets:
            </span>
            <span className="text-xs text-slate-500 ml-1.5 hidden md:inline">
              Load realistic industry resumes to preview scoring instantly
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetChange(preset.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                selectedPresetId === preset.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Resume Input (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <label htmlFor="resume-textarea" className="text-sm font-bold text-slate-900">
                Candidate Resume Text
              </label>
              <span className="text-xs text-rose-500 font-semibold">*Required</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>{wordCount} words</span>
              {resumeText && (
                <button
                  type="button"
                  onClick={() => setResumeText('')}
                  className="text-slate-400 hover:text-rose-600 transition-colors inline-flex items-center gap-1"
                  title="Clear text"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          <div className="relative flex-1">
            <textarea
              id="resume-textarea"
              rows={14}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your full resume here (Summary, Work Experience, Skills, Education)...&#10;&#10;Or click one of the Quick Test Presets above or upload a text file below."
              className="w-full text-xs sm:text-sm font-sans p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent leading-relaxed text-slate-800 placeholder:text-slate-400 resize-y"
            />
          </div>

          {/* File Upload trigger */}
          <div className="flex items-center justify-between pt-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.rtf"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import .txt or .md file</span>
            </button>
            <span className="text-[11px] text-slate-400">
              Plain text or markdown format recommended for pure ATS assessment
            </span>
          </div>
        </div>

        {/* Right Column: Context & Target Job (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          
          {/* Metadata Controls */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Role / Title
              </label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Experience Tier
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {experienceLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Job Description Matching (Optional Toggle) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={includeJobDescription}
                  onChange={(e) => setIncludeJobDescription(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span>Match Against Specific Job Description (JD)</span>
              </label>

              {includeJobDescription && (
                <span className="text-[11px] text-slate-400">
                  {jdWordCount} words
                </span>
              )}
            </div>

            {includeJobDescription && (
              <textarea
                rows={6}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description here to calculate exact keyword match rate and role alignment..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed text-slate-800 placeholder:text-slate-400 resize-y"
              />
            )}
          </div>

          {/* Tips box */}
          <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 text-[11px] text-slate-600 leading-relaxed space-y-1">
            <span className="font-bold text-indigo-900 block">ATS Algorithm Insight:</span>
            <p>
              Leading ATS filters (Workday, Greenhouse, Taleo) scan for hard skill frequency, action verbs, and quantifiable impact ratios.
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || !resumeText.trim()}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Resume with Gemini ATS Grader...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Score &amp; Optimize Resume</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
