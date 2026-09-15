export interface SamplePersona {
  id: string;
  label: string;
  icon: string;
  country: string;
  job_title: string;
  experience: number;
  education: string;
  location: string;
  company_size: string;
  skills: string[];
}

export interface SalaryPercentiles {
  p25: number;
  median: number;
  p75: number;
  p90: number;
}

export interface SalaryForecastItem {
  year: string;
  experience: number;
  salary: number;
}

export interface MarketBenchmark {
  market_average: number;
  percent_diff: number;
  role: string;
}

export interface SalaryPrediction {
  country: string;
  currency_symbol: string;
  currency_code: string;
  predicted_salary: number;
  formatted_salary: string;
  percentiles: SalaryPercentiles;
  experience_multiplier: number;
  confidence_score: number;
  forecast_3yr: SalaryForecastItem[];
  market_benchmark: MarketBenchmark;
}

export interface ScoreBreakdown {
  skills: number;
  role_fit: number;
  experience: number;
  education: number;
}

export interface JobMatch {
  job_id: number;
  job_title: string;
  company: string;
  location: string;
  country: string;
  domain: string;
  experience_req: number;
  education_req: string;
  salary_range: string;
  match_score: number;
  score_breakdown: ScoreBreakdown;
  matched_skills: string[];
  missing_skills: string[];
  job_skills: string[];
  apply_url?: string;
}

export interface SkillGapAnalysis {
  target_role: string;
  overall_readiness_score: number;
  matched_skills: string[];
  missing_critical: string[];
  missing_recommended: string[];
}

export interface RoadmapMilestone {
  phase: string;
  timeline: string;
  title: string;
  description: string;
  action_items: string[];
  skills_to_acquire: string[];
}

export interface CareerRoadmap {
  target_role: string;
  milestones: RoadmapMilestone[];
}

// ─── Resume Project & Work Experience Items ───────────────────────────────────
export interface ResumeProjectItem {
  name: string;
  description?: string | null;
  skills: string[];
}

export interface ResumeExperienceItem {
  company?: string | null;
  role?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  description?: string | null;
  skills: string[];
}

export interface ResumeMetadata {
  pages_processed: number;
  text_characters: number;
  is_scanned_pdf: boolean;
  evidence: Record<string, unknown>;
}

// ─── Rich Candidate Profile (from /api/resume/analyze) ───────────────────────
export interface CandidateProfile {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  role_confidence?: number | null;
  target_role?: string | null;
  experience_years?: number | null;
  education?: string | null;
  location?: string | null;
  country: string;
  skills: string[];
  soft_skills: string[];
  certifications: string[];
  projects: ResumeProjectItem[];
  work_experience: ResumeExperienceItem[];
  summary?: string | null;
}

// Full response from /api/resume/analyze
export interface ResumeAnalyzeResponse {
  success: boolean;
  profile: CandidateProfile;
  metadata: ResumeMetadata;
  error_code?: string | null;
  message?: string | null;
}

/**
 * ResumeParseResult: Used internally by the frontend after resume analysis.
 * Maps from CandidateProfile to the shape expected by handleApplyResumeData.
 * Backwards-compatible with the legacy /resume/parse fields.
 */
export interface ResumeParseResult {
  // Legacy fields (kept for backward compat)
  extracted_skills: string[];
  extracted_roles: string[];
  estimated_experience: number;
  extracted_education: string;
  raw_text_length: number;

  // Rich profile fields (from /resume/analyze)
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  country?: string;
  role?: string | null;
  role_confidence?: number | null;
  target_role?: string | null;
  soft_skills: string[];
  certifications: string[];
  projects: ResumeProjectItem[];
  work_experience: ResumeExperienceItem[];
  summary?: string | null;

  // Metadata
  pages_processed?: number;
  is_scanned_pdf?: boolean;
}

export interface AppMetadata {
  all_skills: string[];
  job_titles: string[];
  countries: string[];
  locations_india: string[];
  locations_us: string[];
  education_levels: string[];
  company_sizes: string[];
  employment_types: string[];
  domains: string[];
  sample_personas: SamplePersona[];
}
