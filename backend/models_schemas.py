from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# ─── Salary Prediction Schemas ────────────────────────────────────────────────
class SalaryPredictionRequest(BaseModel):
    country: str = Field(default="India", description="Country ('India' or 'United States')")
    job_title: str = Field(..., description="Job role")
    experience: float = Field(..., ge=0, le=40, description="Years of experience")
    education: str = Field(..., description="Education level")
    company_size: str = Field(default="Medium", description="Company size")
    employment_type: str = Field(default="Full-time", description="Employment type")
    location: str = Field(..., description="City or location")
    skills: List[str] = Field(default_factory=list, description="List of user skills")

class SalaryPercentiles(BaseModel):
    p25: float
    median: float
    p75: float
    p90: float

class SalaryPredictionResponse(BaseModel):
    country: str
    currency_symbol: str
    currency_code: str
    predicted_salary: float
    formatted_salary: str
    percentiles: SalaryPercentiles
    experience_multiplier: float
    confidence_score: float
    forecast_3yr: List[Dict[str, Any]]
    market_benchmark: Dict[str, Any]


# ─── Job Recommendation Schemas ───────────────────────────────────────────────
class JobRecommendRequest(BaseModel):
    user_skills: List[str] = Field(..., description="List of user skills")
    target_role: Optional[str] = Field(None, description="Optional target job title")
    experience: float = Field(default=2.0, ge=0, description="Years of experience")
    education: str = Field(default="Bachelor", description="User education level")
    location: Optional[str] = Field(None, description="Preferred location")
    domain: Optional[str] = Field(None, description="Preferred domain / industry")
    country: Optional[str] = Field("India", description="Preferred country")
    top_k: int = Field(default=8, ge=1, le=50, description="Number of results to return")

class JobMatchResult(BaseModel):
    job_id: int
    job_title: str
    company: str
    location: str
    country: str
    domain: str
    experience_req: float
    education_req: str
    salary_range: str
    match_score: float
    score_breakdown: Dict[str, float]
    matched_skills: List[str]
    missing_skills: List[str]
    job_skills: List[str]
    apply_url: Optional[str] = None

class JobRecommendResponse(BaseModel):
    total_matched: int
    jobs: List[JobMatchResult]


# ─── Skill Gap & Roadmap Schemas ──────────────────────────────────────────────
class SkillGapRequest(BaseModel):
    user_skills: List[str]
    target_role: str
    experience: Optional[float] = 2.0

class SkillGapResponse(BaseModel):
    target_role: str
    overall_readiness_score: float
    matched_skills: List[str]
    missing_critical: List[str]
    missing_recommended: List[str]

class RoadmapMilestone(BaseModel):
    phase: str
    timeline: str
    title: str
    description: str
    action_items: List[str]
    skills_to_acquire: List[str]

class RoadmapResponse(BaseModel):
    target_role: str
    milestones: List[RoadmapMilestone]


# ─── Comprehensive Resume Analyzer Schemas ────────────────────────────────────
class ProjectItem(BaseModel):
    name: str
    description: Optional[str] = None
    skills: List[str] = Field(default_factory=list)

class ExperienceItem(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    skills: List[str] = Field(default_factory=list)

class CandidateProfile(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    role_confidence: Optional[float] = None
    target_role: Optional[str] = None
    experience_years: Optional[float] = None
    education: Optional[str] = None
    location: Optional[str] = None
    country: Optional[str] = "India"
    skills: List[str] = Field(default_factory=list)
    soft_skills: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    projects: List[ProjectItem] = Field(default_factory=list)
    work_experience: List[ExperienceItem] = Field(default_factory=list)
    summary: Optional[str] = None

class ResumeMetadata(BaseModel):
    pages_processed: int = 1
    text_characters: int = 0
    is_scanned_pdf: bool = False
    evidence: Dict[str, Any] = Field(default_factory=dict)

class ResumeAnalyzeResponse(BaseModel):
    success: bool
    profile: CandidateProfile
    metadata: ResumeMetadata
    error_code: Optional[str] = None
    message: Optional[str] = None

# Backwards compatible legacy schema
class ResumeParseResponse(BaseModel):
    extracted_skills: List[str]
    extracted_roles: List[str]
    estimated_experience: float
    extracted_education: str
    raw_text_length: int
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    target_role: Optional[str] = None
    soft_skills: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    projects: List[ProjectItem] = Field(default_factory=list)
    work_experience: List[ExperienceItem] = Field(default_factory=list)
