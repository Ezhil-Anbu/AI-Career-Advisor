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

export interface LearningResource {
  skill: string;
  title: string;
  description: string;
  icon: string;
  url: string;
  priority: 'Critical' | 'Recommended' | 'Bonus';
}

export interface SkillGapAnalysis {
  target_role: string;
  overall_readiness_score: number;
  matched_skills: string[];
  missing_critical: string[];
  missing_recommended: string[];
  learning_resources: LearningResource[];
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

export interface ResumeParseResult {
  extracted_skills: string[];
  extracted_roles: string[];
  estimated_experience: number;
  extracted_education: string;
  raw_text_length: number;
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
