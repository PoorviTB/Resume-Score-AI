export interface CategoryScore {
  score: number;
  feedback: string;
}

export interface ImpactAndMetricsScore extends CategoryScore {
  quantifiedBulletsRatio: string;
}

export interface AtsCompatibilityScore extends CategoryScore {
  parsabilityFlags: string[];
}

export interface SkillsAndKeywordsScore extends CategoryScore {
  matchPercentage: number;
}

export interface BrevityAndClarityScore extends CategoryScore {
  estimatedPages: string;
}

export interface CategoryScores {
  impactAndMetrics: ImpactAndMetricsScore;
  atsCompatibility: AtsCompatibilityScore;
  skillsAndKeywords: SkillsAndKeywordsScore;
  brevityAndClarity: BrevityAndClarityScore;
  jobAlignment: CategoryScore;
}

export interface CriticalFix {
  issue: string;
  whyItMatters: string;
  howToFix: string;
  severity: 'high' | 'medium' | 'low';
}

export interface MissingKeyword {
  keyword: string;
  category: string;
  importance: 'Essential' | 'Recommended';
  context: string;
}

export interface KeywordAnalysis {
  foundKeywords: string[];
  missingKeywords: MissingKeyword[];
}

export interface BulletRewrite {
  original: string;
  improved: string;
  reasoning: string;
  formula: {
    action: string;
    metric: string;
    method: string;
  };
}

export interface SectionAuditItem {
  sectionName: string;
  status: 'Pass' | 'Warning' | 'Missing';
  recommendation: string;
}

export interface ScoringResult {
  overallScore: number;
  grade: string;
  verdict: string;
  summary: string;
  categoryScores: CategoryScores;
  keyStrengths: string[];
  criticalFixes: CriticalFix[];
  keywordAnalysis: KeywordAnalysis;
  bulletRewrites: BulletRewrite[];
  sectionAudit: SectionAuditItem[];
  tailoredPitch: string;
  suggestedInterviewQuestions: string[];
}

export interface ResumeScanHistoryItem {
  id: string;
  timestamp: number;
  targetRole: string;
  overallScore: number;
  grade: string;
  resumePreview: string;
  jobDescriptionProvided: boolean;
  result: ScoringResult;
}

export interface ResumePreset {
  id: string;
  name: string;
  role: string;
  industry: string;
  experienceLevel: string;
  description: string;
  resumeText: string;
  jobDescription?: string;
}

export interface BulletRewriteVariation {
  style: string;
  bullet: string;
  explanation: string;
  actionVerb: string;
}

export interface BulletRewriteResponse {
  original: string;
  critique: string;
  variations: BulletRewriteVariation[];
}

export interface CoverLetterResponse {
  subjectLine: string;
  salutation: string;
  openingHook: string;
  bodyParagraphs: string[];
  callToAction: string;
  fullFormattedLetter: string;
}
