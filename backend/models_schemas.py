from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

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

class SkillGapRequest(BaseModel):
    user_skills: List[str]
    target_role: str
    experience: Optional[float] = 2.0

class LearningResource(BaseModel):
    skill: str
    title: str
    description: str
    icon: str
    url: str
    priority: str  # 'Critical', 'Recommended', 'Bonus'

class SkillGapResponse(BaseModel):
    target_role: str
    overall_readiness_score: float
    matched_skills: List[str]
    missing_critical: List[str]
    missing_recommended: List[str]
    learning_resources: List[LearningResource]

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

class ResumeParseResponse(BaseModel):
    extracted_skills: List[str]
    extracted_roles: List[str]
    estimated_experience: float
    extracted_education: str
    raw_text_length: int
