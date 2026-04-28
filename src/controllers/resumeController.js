const { validationResult } = require("express-validator");

// Minimal ATS-like check: look for presence of keywords tied to common resume points.
const RESUME_CHECKPOINTS = [
  { id: 'resume-contact-info', label: 'Clear contact information', keywords: ['phone', 'email', 'linkedin', 'github'] },
  { id: 'resume-professional-summary', label: 'Professional summary', keywords: ['summary', 'profile', 'overview', 'objective'] },
  { id: 'resume-work-experience', label: 'Work experience', keywords: ['experience', 'worked', 'role', 'company'] },
  { id: 'resume-achievements', label: 'Quantified achievements', keywords: ['%', 'percent', 'increased', 'decreased', 'improved', 'reduced'] },
  { id: 'resume-projects', label: 'Relevant projects', keywords: ['project', 'built', 'developed', 'implemented'] },
  { id: 'resume-education', label: 'Education', keywords: ['bachelor', 'master', 'degree', 'university', 'college'] },
  { id: 'resume-skills', label: 'Technical skills', keywords: ['skills', 'javascript', 'python', 'react', 'node', 'java', 'c++'] },
  { id: 'resume-keywords', label: 'Role-specific keywords', keywords: ['aws', 'docker', 'kubernetes', 'sql', 'nosql', 'rest'] },
  { id: 'resume-formatting', label: 'Consistent formatting', keywords: ['•', '-', '\\n'] },
  { id: 'resume-length', label: 'Appropriate length', keywords: [] },
  { id: 'resume-action-verbs', label: 'Action verbs', keywords: ['led', 'implemented', 'designed', 'launched', 'improved'] },
  { id: 'resume-metrics', label: 'Metrics for impact', keywords: ['users', 'revenue', 'sales', 'uptime', 'latency'] },
  { id: 'resume-customization', label: 'Customized for role', keywords: ['target', 'apply', 'role', 'position'] },
  { id: 'resume-links', label: 'Working links', keywords: ['http', 'https', 'linkedin.com', 'github.com'] },
  { id: 'resume-proofreading', label: 'Proofread', keywords: ['typo', 'grammar', 'spelling'] },
];

const atsCheck = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid request', errors: errors.array() });

    const { resumeText = '' } = req.body;
    const text = String(resumeText || '').toLowerCase();

    const details = RESUME_CHECKPOINTS.map((cp) => {
      if (!cp.keywords.length && cp.id === 'resume-length') {
        // simple length heuristic: 1-2 pages ~ 250-1200 words
        const words = text.split(/\s+/).filter(Boolean).length;
        const matched = words > 0 && words <= 1400; // allow up to ~1400 words
        return { id: cp.id, label: cp.label, matched, reason: `words:${words}` };
      }

      const matched = cp.keywords.some((kw) => text.includes(kw.toLowerCase()));
      return { id: cp.id, label: cp.label, matched };
    });

    const matched = details.filter((d) => d.matched).map((d) => d.id);
    const missing = details.filter((d) => !d.matched).map((d) => d.id);

    const score = Math.round((matched.length / RESUME_CHECKPOINTS.length) * 100);

    return res.json({ score, total: RESUME_CHECKPOINTS.length, matched, missing, details });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  atsCheck,
};
