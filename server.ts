import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Resilient AI generation helper that utilizes gemini-3.1-flash-lite with fallback to gemini-3.8-flash
async function generateGeminiJson(options: {
  contents: string;
  systemInstruction?: string;
  responseSchema?: any;
}) {
  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const config: any = {
        responseMimeType: 'application/json',
      };
      if (options.systemInstruction) {
        config.systemInstruction = options.systemInstruction;
      }
      if (options.responseSchema) {
        config.responseSchema = options.responseSchema;
      }

      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config,
      });

      if (response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} encountered error: ${err?.message || err}. Attempting fallback...`);
      lastError = err;
      if (err.status === 503 || err.status === 429) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }
  }

  throw lastError || new Error('AI evaluation service is temporarily unavailable. Please try again.');
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Resume Scoring Schema definition
const scoringSchema = {
  type: Type.OBJECT,
  properties: {
    overallScore: {
      type: Type.INTEGER,
      description: 'Overall score from 0 to 100 based on ATS criteria and industry standards',
    },
    grade: {
      type: Type.STRING,
      description: 'Letter grade: A+, A, B, C, D, or F',
    },
    verdict: {
      type: Type.STRING,
      description: 'One punchy sentence summarizing candidate standing (e.g., "Strong candidate with high ATS keyword alignment but needs quantified metrics")',
    },
    summary: {
      type: Type.STRING,
      description: 'A 2-3 paragraph detailed professional appraisal of the resume strengths, presentation, and positioning',
    },
    categoryScores: {
      type: Type.OBJECT,
      properties: {
        impactAndMetrics: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: 'Score 0-100 on Google XYZ formula use and quantifiable data' },
            feedback: { type: Type.STRING, description: 'Specific feedback on metrics and action verbs' },
            quantifiedBulletsRatio: { type: Type.STRING, description: 'Ratio string e.g. "4 / 14 bullets contain measurable numbers"' },
          },
          required: ['score', 'feedback', 'quantifiedBulletsRatio'],
        },
        atsCompatibility: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: 'Score 0-100 on layout readability, headers, and ATS parsability' },
            feedback: { type: Type.STRING, description: 'ATS specific feedback' },
            parsabilityFlags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Potential ATS parsing issues found, or positive confirmation if clean',
            },
          },
          required: ['score', 'feedback', 'parsabilityFlags'],
        },
        skillsAndKeywords: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: 'Score 0-100 on relevant technical and domain skill presence' },
            feedback: { type: Type.STRING, description: 'Skill coverage feedback' },
            matchPercentage: { type: Type.INTEGER, description: 'Estimated skill coverage % (0-100)' },
          },
          required: ['score', 'feedback', 'matchPercentage'],
        },
        brevityAndClarity: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: 'Score 0-100 on concise language, active voice, and formatting density' },
            feedback: { type: Type.STRING, description: 'Word choice and density feedback' },
            estimatedPages: { type: Type.STRING, description: 'Estimated page length (e.g. "1 page", "2 pages")' },
          },
          required: ['score', 'feedback', 'estimatedPages'],
        },
        jobAlignment: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: 'Score 0-100 on match to target job description or target role level' },
            feedback: { type: Type.STRING, description: 'Target job alignment feedback' },
          },
          required: ['score', 'feedback'],
        },
      },
      required: ['impactAndMetrics', 'atsCompatibility', 'skillsAndKeywords', 'brevityAndClarity', 'jobAlignment'],
    },
    keyStrengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3 to 5 notable strengths identified in the resume with concrete examples',
    },
    criticalFixes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          issue: { type: Type.STRING, description: 'Specific weakness or red flag' },
          whyItMatters: { type: Type.STRING, description: 'Why recruiters or ATS reject resumes for this' },
          howToFix: { type: Type.STRING, description: 'Actionable concrete guidance to resolve' },
          severity: { type: Type.STRING, description: '"high", "medium", or "low"' },
        },
        required: ['issue', 'whyItMatters', 'howToFix', 'severity'],
      },
      description: 'Prioritized list of fixes ordered from most critical to least',
    },
    keywordAnalysis: {
      type: Type.OBJECT,
      properties: {
        foundKeywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Strong technical and functional keywords detected in the resume',
        },
        missingKeywords: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              keyword: { type: Type.STRING, description: 'Keyword name' },
              category: { type: Type.STRING, description: 'e.g. "Technical Skill", "Tool/Framework", "Soft Skill", "Domain Expertise"' },
              importance: { type: Type.STRING, description: '"Essential" or "Recommended"' },
              context: { type: Type.STRING, description: 'Where or how candidate could integrate this' },
            },
            required: ['keyword', 'category', 'importance', 'context'],
          },
          description: 'Missing keywords that are critical for ATS ranking for this target role',
        },
      },
      required: ['foundKeywords', 'missingKeywords'],
    },
    bulletRewrites: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING, description: 'Exact or near-exact weak bullet extracted from resume' },
          improved: { type: Type.STRING, description: 'Enhanced bullet following Google XYZ formula (Accomplished [X] measured by [Y] by doing [Z])' },
          reasoning: { type: Type.STRING, description: 'Why this rewrite is significantly stronger' },
          formula: {
            type: Type.OBJECT,
            properties: {
              action: { type: Type.STRING, description: 'Strong active verb and accomplishment (X)' },
              metric: { type: Type.STRING, description: 'Measurable metric, scale, or outcome (Y)' },
              method: { type: Type.STRING, description: 'Technologies, methodology, or specific actions taken (Z)' },
            },
            required: ['action', 'metric', 'method'],
          },
        },
        required: ['original', 'improved', 'reasoning', 'formula'],
      },
      description: '3 to 6 high-impact before-and-after bullet point transformations',
    },
    sectionAudit: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sectionName: { type: Type.STRING, description: 'Section name e.g. "Contact Information", "Professional Summary", "Work Experience", "Education", "Skills", "Projects"' },
          status: { type: Type.STRING, description: '"Pass", "Warning", or "Missing"' },
          recommendation: { type: Type.STRING, description: 'Review note and suggested improvements' },
        },
        required: ['sectionName', 'status', 'recommendation'],
      },
      description: 'Comprehensive section-by-section audit',
    },
    tailoredPitch: {
      type: Type.STRING,
      description: 'A polished, modern 2-3 sentence executive summary / pitch optimized for this candidate',
    },
    suggestedInterviewQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3 questions hiring managers will likely ask based on gaps or ambiguous claims',
    },
  },
  required: [
    'overallScore',
    'grade',
    'verdict',
    'summary',
    'categoryScores',
    'keyStrengths',
    'criticalFixes',
    'keywordAnalysis',
    'bulletRewrites',
    'sectionAudit',
    'tailoredPitch',
    'suggestedInterviewQuestions',
  ],
};

// API Route: Analyze & Score Resume
app.post('/api/score-resume', async (req: Request, res: Response) => {
  try {
    const { resumeText, jobDescription, targetRole, industry, experienceLevel } = req.body;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 30) {
      return res.status(400).json({
        error: 'Resume text is required and must contain substantial content (minimum 30 characters).',
      });
    }

    const prompt = `You are a Principal Talent Acquisition Lead and ATS (Applicant Tracking System) Evaluation Expert who has reviewed over 20,000 top-tier resumes at Fortune 500 tech companies and premier enterprises.

Evaluate this candidate's resume with rigorous, realistic, high-standard assessment. Do not give inflated scores. Real top-tier resumes typically score 80-92, average resumes score 55-70, and weak resumes score 35-50.

Target Role / Title: ${targetRole || 'Not specified (infer from resume)'}
Target Industry: ${industry || 'Technology / General'}
Experience Level: ${experienceLevel || 'Mid-Senior Level'}

${jobDescription ? `TARGET JOB DESCRIPTION TO MATCH AGAINST:\n"""\n${jobDescription}\n"""` : 'No specific Job Description provided. Score against industry benchmarks and best practices for the candidate’s inferred role.'}

CANDIDATE RESUME TEXT:
"""
${resumeText}
"""

Evaluate the resume across all criteria in the response schema:
1. Overall ATS Score & Grade (strict, fair, calibrated against modern ATS algorithms like Workday, Greenhouse, Lever, Taleo)
2. Category Breakdown:
   - Impact & Metrics (Google XYZ formula: Accomplished [X] as measured by [Y] by doing [Z], concrete numbers, revenue, latency, scale, percentages)
   - ATS Compatibility (parse-friendliness, lack of tables/graphics/confusing formats, standard headers)
   - Skills & Keywords (detection of in-demand domain skills, tools, methodologies, and critical missing gaps)
   - Brevity & Clarity (active voice verbs, elimination of fluff like "responsible for", "hardworking", "team player")
   - Job Alignment (if JD provided, exact keyword and responsibility match)
3. Key Strengths with specific excerpts
4. Critical Fixes with prioritized severity
5. Keyword Analysis (Found keywords + Critical missing keywords with context)
6. Bullet Rewrites: Pick 3 to 6 actual bullets from the resume that are vague, task-oriented, or lack metrics, and transform them using the Google XYZ formula into exceptional achievement statements.
7. Section Audit for Contact Info, Summary, Experience, Education, Skills, and Projects.
8. Tailored Pitch: Write an executive summary that instantly hooks recruiters.
9. Suggested Interview Questions to prepare for.

Be objective, constructive, and highly actionable.`;

    const rawJson = await generateGeminiJson({
      contents: prompt,
      systemInstruction: 'You are an elite executive resume coach, ATS algorithm engineer, and senior hiring director. You provide precise, rigorous, and actionable resume analysis with zero fluff.',
      responseSchema: scoringSchema,
    });

    const parsedData = JSON.parse(rawJson);
    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error analyzing resume:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to analyze resume. Please verify input and try again.',
    });
  }
});

// API Route: Interactive Bullet Point Rewriter
app.post('/api/rewrite-bullet', async (req: Request, res: Response) => {
  try {
    const { originalBullet, contextRole, targetMetric } = req.body;

    if (!originalBullet || typeof originalBullet !== 'string') {
      return res.status(400).json({ error: 'Original bullet text is required' });
    }

    const prompt = `Transform this resume bullet point into 3 distinct high-impact variations using Google's XYZ formula ("Accomplished [X] as measured by [Y], by doing [Z]").

Original Bullet: "${originalBullet}"
Target Role Context: "${contextRole || 'Professional Role'}"
${targetMetric ? `Target metric/outcome to highlight: "${targetMetric}"` : ''}

Provide 3 variations:
1. Metrics & Scale Focused (emphasizes quantitative business impact, percentages, or scale)
2. Leadership & Innovation Focused (emphasizes ownership, architecture, and driving change)
3. Efficiency & Optimization Focused (emphasizes speed, cost savings, or reliability)

Return JSON according to the schema.`;

    const bulletSchema = {
      type: Type.OBJECT,
      properties: {
        original: { type: Type.STRING },
        critique: { type: Type.STRING, description: 'Short critique of why the original bullet is weak or passive' },
        variations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              style: { type: Type.STRING, description: 'Style name e.g. "Metrics & Scale", "Leadership & Initiative", "Process Optimization"' },
              bullet: { type: Type.STRING, description: 'The rewritten high-impact bullet point' },
              explanation: { type: Type.STRING, description: 'Why this works better' },
              actionVerb: { type: Type.STRING, description: 'Strong active verb used' },
            },
            required: ['style', 'bullet', 'explanation', 'actionVerb'],
          },
        },
      },
      required: ['original', 'critique', 'variations'],
    };

    const rawJson = await generateGeminiJson({
      contents: prompt,
      responseSchema: bulletSchema,
    });

    const parsed = JSON.parse(rawJson || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error rewriting bullet:', error);
    return res.status(500).json({ error: error?.message || 'Failed to rewrite bullet.' });
  }
});

// API Route: Tailored Cover Letter Generator based on Resume + Job Description
app.post('/api/generate-cover-letter', async (req: Request, res: Response) => {
  try {
    const { resumeText, jobDescription, targetRole, companyName, tone } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text is required.' });
    }

    const prompt = `Write a bespoke, compelling, modern cover letter for:
Candidate Resume:
"""
${resumeText.slice(0, 3000)}
"""

Target Role: ${targetRole || 'Target Position'}
Company Name: ${companyName || 'Hiring Team'}
Tone: ${tone || 'Professional & Confident'}

Job Description:
"""
${(jobDescription || '').slice(0, 2000)}
"""

Write a modern, authentic cover letter (no cliché openings like "I am writing to express my interest in..."). Hook the reader with a clear value proposition, connect 2 real accomplishments from the resume directly to the company's needs, and conclude with a forward-looking call to action.

Return in JSON format.`;

    const letterSchema = {
      type: Type.OBJECT,
      properties: {
        subjectLine: { type: Type.STRING },
        salutation: { type: Type.STRING },
        openingHook: { type: Type.STRING },
        bodyParagraphs: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        callToAction: { type: Type.STRING },
        fullFormattedLetter: { type: Type.STRING },
      },
      required: ['subjectLine', 'salutation', 'openingHook', 'bodyParagraphs', 'callToAction', 'fullFormattedLetter'],
    };

    const rawJson = await generateGeminiJson({
      contents: prompt,
      responseSchema: letterSchema,
    });

    const parsed = JSON.parse(rawJson || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating cover letter:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate cover letter.' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
