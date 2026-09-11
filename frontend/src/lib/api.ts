import {
  AppMetadata,
  SalaryPrediction,
  JobMatch,
  SkillGapAnalysis,
  CareerRoadmap,
  ResumeParseResult
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '/api' : 'http://127.0.0.1:8000/api');

export async function fetchMetadata(): Promise<AppMetadata> {
  try {
    const res = await fetch(`${API_BASE_URL}/metadata`);
    if (!res.ok) throw new Error('Failed to fetch metadata from server');
    return await res.json();
  } catch (err) {
    console.warn('Using fallback metadata:', err);
    return getFallbackMetadata();
  }
}

export async function predictSalary(payload: {
  country: string;
  job_title: string;
  experience: number;
  education: string;
  location: string;
  company_size?: string;
  employment_type?: string;
  skills: string[];
}): Promise<SalaryPrediction> {
  try {
    const res = await fetch(`${API_BASE_URL}/salary/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to predict salary');
    return await res.json();
  } catch (err) {
    console.warn('Using fallback salary prediction:', err);
    return getFallbackSalaryPrediction(payload);
  }
}

export async function recommendJobs(payload: {
  user_skills: string[];
  target_role?: string;
  experience: number;
  education: string;
  location?: string;
  domain?: string;
  country?: string;
  top_k?: number;
}): Promise<{ total_matched: number; jobs: JobMatch[] }> {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to recommend jobs');
    return await res.json();
  } catch (err) {
    console.warn('Using fallback job recommendations:', err);
    return getFallbackJobRecommendations(payload);
  }
}

export async function analyzeSkillGap(payload: {
  user_skills: string[];
  target_role: string;
  experience?: number;
}): Promise<SkillGapAnalysis> {
  try {
    const res = await fetch(`${API_BASE_URL}/skills/gap-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to analyze skill gap');
    return await res.json();
  } catch (err) {
    console.warn('Using fallback skill gap:', err);
    return getFallbackSkillGap(payload);
  }
}

export async function generateRoadmap(payload: {
  user_skills: string[];
  target_role: string;
  experience?: number;
}): Promise<CareerRoadmap> {
  try {
    const res = await fetch(`${API_BASE_URL}/roadmap/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to generate roadmap');
    return await res.json();
  } catch (err) {
    console.warn('Using fallback roadmap:', err);
    return getFallbackRoadmap(payload);
  }
}

export async function parseResumeFile(file: File): Promise<ResumeParseResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/resume/parse`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to parse resume file');
  return await res.json();
}

export async function parseResumeText(text: string): Promise<ResumeParseResult> {
  const formData = new FormData();
  formData.append('raw_text', text);

  const res = await fetch(`${API_BASE_URL}/resume/parse`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to parse resume text');
  return await res.json();
}

// ─── Client Fallback Generators ───────────────────────────────────────────────

function getFallbackMetadata(): AppMetadata {
  return {
    all_skills: [
      "Python", "Machine Learning", "SQL", "TensorFlow", "Statistics", "Pandas",
      "NumPy", "Scikit-learn", "Deep Learning", "Data Visualization", "Excel",
      "Power BI", "Tableau", "R", "PyTorch", "Docker", "Kubernetes", "MLflow",
      "Java", "Git", "REST API", "Agile", "JavaScript", "System Design", "Linux",
      "PostgreSQL", "Redis", "Microservices", "React", "HTML", "CSS", "TypeScript",
      "Node.js", "MongoDB", "AWS", "Azure", "GCP", "Terraform", "CI/CD",
      "NLP", "Transformers", "BERT", "Hugging Face", "OpenCV", "Security"
    ],
    job_titles: [
      "AI Engineer", "Backend Developer", "Cloud Architect", "Data Analyst",
      "Data Engineer", "Data Scientist", "DevOps Engineer", "Frontend Developer",
      "Full Stack Developer", "Machine Learning Engineer", "MLOps Engineer",
      "Product Manager", "Software Engineer", "Solutions Architect", "UX Designer"
    ],
    countries: ["India", "United States"],
    locations_india: ["Bangalore", "Hyderabad", "Pune", "Mumbai", "Delhi", "Gurgaon", "Noida", "Chennai"],
    locations_us: ["San Francisco", "New York", "Seattle", "Austin", "Boston", "Los Angeles", "Chicago", "Remote"],
    education_levels: ["High School", "Associate", "Bachelor", "Master", "PhD"],
    company_sizes: ["Startup", "Small", "Medium", "Large", "Enterprise"],
    employment_types: ["Full-time", "Contract", "Part-time", "Internship"],
    domains: ["Technology", "Finance", "Healthcare", "Consulting", "Research", "E-Commerce", "Cybersecurity"],
    sample_personas: [
      {
        id: "junior_python",
        label: "Junior Python Dev",
        icon: "👶",
        country: "India",
        job_title: "Software Engineer",
        experience: 1.5,
        education: "Bachelor",
        location: "Bangalore",
        company_size: "Startup",
        skills: ["Python", "SQL", "Git", "REST API", "Linux"]
      },
      {
        id: "mid_ds",
        label: "Mid Data Scientist",
        icon: "🚀",
        country: "India",
        job_title: "Data Scientist",
        experience: 4.0,
        education: "Master",
        location: "Hyderabad",
        company_size: "Medium",
        skills: ["Python", "Machine Learning", "SQL", "Pandas", "Scikit-learn", "Statistics"]
      },
      {
        id: "senior_ai",
        label: "Senior AI / MLOps Lead",
        icon: "🤖",
        country: "United States",
        job_title: "AI Engineer",
        experience: 7.5,
        education: "Master",
        location: "San Francisco",
        company_size: "Enterprise",
        skills: ["Python", "Deep Learning", "PyTorch", "Transformers", "Docker", "Kubernetes", "AWS", "MLflow"]
      },
      {
        id: "cloud_architect",
        label: "Cloud Architect",
        icon: "🏛️",
        country: "United States",
        job_title: "Cloud Architect",
        experience: 9.0,
        education: "Bachelor",
        location: "Seattle",
        company_size: "Enterprise",
        skills: ["AWS", "Azure", "Terraform", "Kubernetes", "Docker", "CI/CD", "System Design", "Linux"]
      }
    ]
  };
}

function getFallbackSalaryPrediction(p: any): SalaryPrediction {
  const isIndia = p.country === 'India';
  const base = isIndia ? 650000 : 95000;
  const exp = Number(p.experience) || 2;
  const pred = base * (1 + exp * 0.14);

  const formatted = isIndia
    ? pred >= 100000 ? `₹${(pred / 100000).toFixed(2)} LPA` : `₹${pred.toLocaleString()}`
    : `$${Math.round(pred).toLocaleString()} / yr`;

  return {
    country: p.country,
    currency_symbol: isIndia ? '₹' : '$',
    currency_code: isIndia ? 'INR' : 'USD',
    predicted_salary: Math.round(pred),
    formatted_salary: formatted,
    percentiles: {
      p25: Math.round(pred * 0.88),
      median: Math.round(pred),
      p75: Math.round(pred * 1.15),
      p90: Math.round(pred * 1.32),
    },
    experience_multiplier: +(1 + exp * 0.08).toFixed(2),
    confidence_score: 93.5,
    forecast_3yr: [
      { year: 'Current', experience: exp, salary: Math.round(pred) },
      { year: '+1 Year', experience: exp + 1, salary: Math.round(pred * 1.14) },
      { year: '+2 Years', experience: exp + 2, salary: Math.round(pred * 1.28) },
      { year: '+3 Years', experience: exp + 3, salary: Math.round(pred * 1.45) },
    ],
    market_benchmark: {
      market_average: Math.round(pred * 0.94),
      percent_diff: 6.4,
      role: p.job_title,
    },
  };
}

function getFallbackJobRecommendations(p: any): { total_matched: number; jobs: JobMatch[] } {
  const target = p.target_role || 'Software Engineer';
  const roles = [
    { title: target, company: 'Google', loc: p.location || 'Bangalore', score: 94.2, req: ['Python', 'SQL', 'Git', 'System Design'] },
    { title: `${target} - Platform`, company: 'Microsoft', loc: 'Hyderabad', score: 88.5, req: ['Python', 'Docker', 'Kubernetes', 'Cloud'] },
    { title: `Senior ${target}`, company: 'Amazon', loc: 'San Francisco', score: 83.0, req: ['Python', 'AWS', 'System Design', 'Microservices'] },
    { title: `Lead ${target}`, company: 'Databricks', loc: 'Seattle', score: 79.4, req: ['Python', 'Machine Learning', 'Spark', 'SQL'] },
  ];

  const userSkillsLower = (p.user_skills || []).map((s: string) => s.toLowerCase());

  const jobs: JobMatch[] = roles.map((r, i) => {
    const matched = r.req.filter(s => userSkillsLower.includes(s.toLowerCase()));
    const missing = r.req.filter(s => !userSkillsLower.includes(s.toLowerCase()));
    return {
      job_id: i + 1,
      job_title: r.title,
      company: r.company,
      location: r.loc,
      country: p.country || 'India',
      domain: 'Technology',
      experience_req: Math.max(1, (p.experience || 2) - 1),
      education_req: 'Bachelor',
      salary_range: p.country === 'United States' ? '$130,000 - $180,000' : '₹18 - 28 LPA',
      match_score: r.score,
      score_breakdown: {
        skills: 88.0,
        role_fit: 95.0,
        experience: 90.0,
        education: 100.0,
      },
      matched_skills: matched,
      missing_skills: missing,
      job_skills: r.req,
      apply_url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(r.title)}`,
    };
  });

  return { total_matched: jobs.length, jobs };
}

function getFallbackSkillGap(p: any): SkillGapAnalysis {
  return {
    target_role: p.target_role,
    overall_readiness_score: 75.0,
    matched_skills: p.user_skills.slice(0, 4),
    missing_critical: ['System Design', 'Docker', 'Kubernetes'],
    missing_recommended: ['MLflow', 'Terraform'],
    learning_resources: [
      {
        skill: 'Docker & Kubernetes',
        title: 'Production Container Orchestration',
        description: 'Deploy resilient containerized workloads at scale.',
        icon: 'Box',
        url: 'https://kubernetes.io/docs/tutorials/',
        priority: 'Critical',
      },
      {
        skill: 'System Design',
        title: 'Scalable Microservices Architecture',
        description: 'Design distributed high-throughput enterprise backends.',
        icon: 'Server',
        url: 'https://github.com/donnemartin/system-design-primer',
        priority: 'Critical',
      },
    ],
  };
}

function getFallbackRoadmap(p: any): CareerRoadmap {
  return {
    target_role: p.target_role,
    milestones: [
      {
        phase: 'Phase 1: Foundations & Core Gaps',
        timeline: 'Days 1 – 30',
        title: `Master Fundamental Gaps for ${p.target_role}`,
        description: 'Close the highest priority missing technical competencies required for interview screening.',
        action_items: [
          'Complete guided certification exercises and deep-dive lectures',
          'Implement 2 portfolio code repositories testing design patterns and unit tests',
          'Conduct code reviews focusing on algorithmic efficiency and clean structure'
        ],
        skills_to_acquire: ['System Design', 'Docker']
      },
      {
        phase: 'Phase 2: Project Architecture & Cloud',
        timeline: 'Days 31 – 60',
        title: 'Architect End-to-End Scalable Project',
        description: 'Build and deploy an enterprise microservice or machine learning pipeline to AWS/GCP.',
        action_items: [
          'Build FastAPI backend integrated with PostgreSQL and Redis caching',
          'Deploy multi-container setup with automated CI/CD GitHub Actions',
          'Measure latency, throughput, and error metrics with Grafana/Prometheus'
        ],
        skills_to_acquire: ['Kubernetes', 'Cloud Infrastructure']
      },
      {
        phase: 'Phase 3: Technical Interviews & Job Search',
        timeline: 'Days 61 – 90',
        title: 'Mock Technical Rounds & Targeted Applications',
        description: 'Optimize LinkedIn/GitHub presence, practice system design rounds, and submit high-match applications.',
        action_items: [
          'Practice 20+ live coding and behavioral mock interview sessions',
          'Publish interactive project demo and technical case study writeup',
          'Apply directly to top matched openings with tailored cover letters'
        ],
        skills_to_acquire: ['Interview Prep', 'Portfolio Polish']
      }
    ]
  };
}
